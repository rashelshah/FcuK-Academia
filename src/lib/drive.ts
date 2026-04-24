import { google } from 'googleapis';

// Configuration
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1BFPlIHu7XVwk5aYhoFLsObPfsJO0Wwxz';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Authentication
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// Cache Layers
interface DriveFile {
  semester: number;
  subject: string;
  type: 'pyq' | 'notes' | 'ct' | 'unknown';
  year: number | null;
  name: string;
  url: string;
}

interface DriveCache {
  semesters: number[];
  subjects: Record<number, string[]>;
  files: DriveFile[];
}

let driveCache: DriveCache | null = null;
let lastFetchTime = 0;

/**
 * Normalizes subject names for consistent lookup
 */
function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

/**
 * Optimized fetch that retrieves all folders and files in fewer API calls
 * and reconstructs the hierarchy in-memory.
 */
async function fetchAllDriveData(): Promise<DriveCache> {
  const allFiles: DriveFile[] = [];
  const subjectsMap: Record<number, Set<string>> = {};
  const semestersSet = new Set<number>();

  // 1. Fetch ALL folders and files in the drive in parallel
  // We use pagination to ensure we get every single item
  async function listAll(query: string, fields: string) {
    let items: any[] = [];
    let pageToken: string | undefined;
    do {
      const res = await drive.files.list({
        q: query,
        fields: `nextPageToken, ${fields}`,
        pageSize: 1000,
        pageToken,
      });
      items = items.concat(res.data.files || []);
      pageToken = res.data.nextPageToken as string | undefined;
    } while (pageToken);
    return items;
  }

  const [folders, files] = await Promise.all([
    listAll("mimeType = 'application/vnd.google-apps.folder' and trashed = false", "files(id, name, parents)"),
    listAll("mimeType != 'application/vnd.google-apps.folder' and trashed = false", "files(id, name, parents)")
  ]);

  console.log(`📦 Drive Scan: Found ${folders.length} folders and ${files.length} files.`);

  // 2. Build maps for quick lookup
  const folderMap = new Map(folders.map(f => [f.id, f]));
  
  // Helper to check if a folder is a descendant of our ROOT_FOLDER_ID
  // and return its path [Semester, Subject]
  const pathCache = new Map<string, string[] | null>();

  function getPath(folderId: string): string[] | null {
    if (folderId === ROOT_FOLDER_ID) return [];
    if (pathCache.has(folderId)) return pathCache.get(folderId)!;

    const folder = folderMap.get(folderId);
    if (!folder || !folder.parents || folder.parents.length === 0) {
      pathCache.set(folderId, null);
      return null;
    }

    const parentPath = getPath(folder.parents[0]);
    if (parentPath === null) {
      pathCache.set(folderId, null);
      return null;
    }

    const currentPath = [...parentPath, folder.name!];
    pathCache.set(folderId, currentPath);
    return currentPath;
  }

  // 3. Process files
  for (const file of files) {
    if (!file.parents || file.parents.length === 0) continue;

    const path = getPath(file.parents[0]);
    // Path should be [Semester, Subject]
    if (path && path.length >= 2) {
      const semStr = path[0].replace(/semester\s*/i, '').trim();
      const semester = parseInt(semStr, 10);
      const subject = path[1];

      if (!isNaN(semester)) {
        semestersSet.add(semester);
        
        if (!subjectsMap[semester]) subjectsMap[semester] = new Set();
        subjectsMap[semester].add(subject);

        const name = file.name || 'Unknown';
        const lowerName = name.toLowerCase();
        
        // Detection logic:
        // 1. If it contains 'pyq', it's a PYQ
        // 2. If it contains 'ct' as a standalone word, or 'cycle test', it's a CT paper
        // 3. Otherwise, treat as notes
        let type: DriveFile['type'] = 'notes';
        if (lowerName.includes('pyq')) {
          type = 'pyq';
        } else if (/\bct\d*\b|cycle\s*test/i.test(lowerName) || lowerName.startsWith('ct-') || lowerName.startsWith('ct ')) {
          type = 'ct';
          console.log(`🎯 Classified as CT: ${name}`);
        }
        
        const yearMatch = name.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
        const url = `https://drive.google.com/file/d/${file.id}/preview`;

        allFiles.push({
          semester,
          subject,
          type,
          year,
          name,
          url
        });
      }
    }
  }

  // 4. Finalize data structure
  const semesters = Array.from(semestersSet).sort((a, b) => a - b);
  const subjects: Record<number, string[]> = {};
  for (const sem of semesters) {
    subjects[sem] = Array.from(subjectsMap[sem] || []).sort((a, b) => a.localeCompare(b));
  }

  return {
    semesters,
    subjects,
    files: allFiles
  };
}

/**
 * Main data accessor with cache logic
 */
export async function getDriveData(forceRefresh = false): Promise<DriveCache> {
  const now = Date.now();
  const isExpired = now - lastFetchTime > CACHE_TTL;

  if (forceRefresh || !driveCache || isExpired) {
    try {
      driveCache = await fetchAllDriveData();
      lastFetchTime = now;
    } catch (error) {
      console.error('❌ Google Drive Fetch Error:', error);
      if (!driveCache) throw error; // Rethrow if we have no fallback
      // Otherwise, return stale cache as fallback
    }
  }

  return driveCache!;
}

/**
 * Public functions derived from cached data
 */

export async function getSemesters() {
  const data = await getDriveData();
  return data.semesters;
}

export async function getSubjects(semester: string | number) {
  const data = await getDriveData();
  const semNum = typeof semester === 'string' ? parseInt(semester, 10) : semester;
  return data.subjects[semNum] || [];
}

export async function getFiles(semester: string | number, subject: string) {
  const data = await getDriveData();
  const semNum = typeof semester === 'string' ? parseInt(semester, 10) : semester;
  const targetSubject = normalizeName(subject);

  const filtered = data.files.filter(f => 
    f.semester === semNum && 
    normalizeName(f.subject) === targetSubject
  );

  console.log(`📂 Sorting ${filtered.length} files for ${subject}...`);

  return filtered
    .sort((a, b) => {
      // Normalize symbols for a cleaner sort
      const nameA = a.name.toLowerCase().replace(/_/g, '-');
      const nameB = b.name.toLowerCase().replace(/_/g, '-');
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(f => ({
      name: f.name,
      type: f.type,
      year: f.year,
      url: f.url
    }));
}
