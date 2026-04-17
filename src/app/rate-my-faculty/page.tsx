import React from 'react';
import { getRmfFaculties } from '@/lib/server/rmf';
import FacultyListClient from './FacultyListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export default async function RateMyFacultyListPage() {
  const data = await getRmfFaculties();

  if ('error' in data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center p-8 bg-[var(--surface-elevated)] border border-red-500/20 rounded-2xl">
          <p className="text-red-400 font-medium">{data.error}</p>
        </div>
<<<<<<< Updated upstream

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <span className="font-[var(--font-headline)] font-bold tracking-tight text-base text-[var(--text)] drop-shadow-sm opacity-80 uppercase tracking-widest">
            RateMyFaculty
          </span>
        </div>

        <div className="w-10" />
      </motion.div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">

        {/* College Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex justify-between items-end gap-4 mb-8"
        >
          <div className="flex-1 min-w-0">
            <div className="inline-block px-2 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs font-semibold tracking-widest uppercase text-[var(--primary)] mb-3">
              Your Campus
            </div>
            <h1 className="text-[1.45rem] sm:text-5xl font-black font-serif tracking-tight text-[var(--text)] drop-shadow-[0_0_20px_color-mix(in_srgb,var(--text)_20%,transparent)] capitalize leading-[1.2]">
              {college?.name || 'SRMIST Kattankulathur'}
            </h1>
          </div>

          <div className="bg-[var(--surface-elevated)]/60 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-lg shrink-0 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary-soft)]/20 to-transparent pointer-events-none" />
            <div className="text-2xl sm:text-3xl font-black font-[var(--font-headline)] text-[var(--primary)] drop-shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_60%,transparent)] relative z-10">
              {faculties.length > 0 ? faculties.length : '...'}
            </div>
            <div className="text-[10px] tracking-widest font-bold uppercase text-on-surface-variant relative z-10 mt-1">
              Faculty
            </div>
          </div>
        </motion.div>

        {/* Search & Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="relative mb-6 group"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-[var(--primary)]/20 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          <div className="relative flex gap-3 bg-[var(--surface)]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 shadow-lg">
            <div className="flex-1 flex items-center bg-transparent">
              <Search className="ml-4 text-on-surface-variant" size={20} />
              <input
                type="text"
                placeholder="search prof or dept"
                className="w-full bg-transparent border-none outline-none text-[var(--text)] text-sm px-4 py-2 placeholder:text-on-surface-variant/60 font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="shrink-0 px-6 py-2 rounded-full font-bold tracking-widest text-[#1a1a1a] bg-[var(--primary)] hover:brightness-110 transition-all shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_50%,transparent)] uppercase text-xs"
            >
              {showAddForm ? 'Close' : '+ Add'}
            </button>
          </div>
        </motion.div>

        {/* Add Faculty Form Section */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-[var(--surface-elevated)]/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    &times;
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black font-[var(--font-headline)] uppercase tracking-tight">Add a Faculty Member</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Adding to SRMIST Kattankulathur. Please be accurate.</p>
                </div>

                {addError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold">
                    {addError}
                  </div>
                )}

                <form onSubmit={handleAddFaculty} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">Full Name *</label>
                    <input
                      type="text" required
                      placeholder="Dr. John Smith"
                      value={newFaculty.name}
                      onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                      className="w-full bg-[var(--surface-highlight)]/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-[var(--primary)] focus:ring-1 ring-[var(--primary)]/50 outline-none transition-all text-[var(--text)] font-medium placeholder:text-on-surface-variant/40"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">Designation</label>
                      <input
                        type="text"
                        placeholder="Associate Professor"
                        value={newFaculty.designation}
                        onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                        className="w-full bg-[var(--surface-highlight)]/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-[var(--primary)] focus:ring-1 ring-[var(--primary)]/50 outline-none transition-all text-[var(--text)] font-medium placeholder:text-on-surface-variant/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">Department</label>
                      <input
                        type="text"
                        placeholder="Computer Science"
                        value={newFaculty.department}
                        onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                        className="w-full bg-[var(--surface-highlight)]/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-[var(--primary)] focus:ring-1 ring-[var(--primary)]/50 outline-none transition-all text-[var(--text)] font-medium placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-4 rounded-2xl bg-[var(--primary)] text-[#1a1a1a] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
                  >
                    {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'ADD FACULTY MEMBER'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Pill Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {(['RATING', 'REVIEWS', 'NAME'] as SortType[]).map((type) => {
            const isActive = sortBy === type;
            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={type}
                onClick={() => setSortBy(type)}
                className={`relative px-5 py-2 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 overflow-hidden ${isActive
                    ? 'text-[var(--background)] bg-[var(--primary)] shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_40%,transparent)]'
                    : 'bg-[var(--surface-highlight)]/10 border border-white/5 text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]/20 hover:text-[var(--text)]'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-white/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{type}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* LIST View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--primary)]">
            <Loader2 className="animate-spin mb-4" size={32} />
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-[var(--surface-elevated)] border border-red-500/20 rounded-2xl backdrop-blur-md">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        ) : processedFaculties.length === 0 ? (
          <div className="text-center py-16 opacity-60">
            <p className="font-[var(--font-headline)] text-xl">no faculty found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {processedFaculties.map((faculty, i) => (
                <motion.div
                  layout
                  key={faculty.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i < 15 ? i * 0.05 : 0 }}
                >
                  <Link href={`/rate-my-faculty/${faculty.id}`}>
                    <motion.div
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.96 }}
                      className="group relative p-5 bg-[var(--surface)]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* Suble ring on hover */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-white/10" />

                      <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div className="flex-1 min-w-0 pr-2">
                          <h2 className="text-lg font-bold font-[var(--font-headline)] text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate mb-1 capitalize">
                            {faculty.name}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-semibold truncate mb-2 uppercase tracking-wide">
                            <span>{faculty.designation || 'Faculty'}</span>
                            {faculty.department && (
                              <>
                                <span className="opacity-50">•</span>
                                <span className="truncate">{faculty.department}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs font-bold text-[var(--primary)] italic opacity-90">
                            "{getWittyTagline(faculty.stats, faculty.overallRating, faculty.reviewCount)}"
                          </p>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0 bg-[var(--surface-highlight)]/10 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none">
                          <div className="flex items-baseline text-[var(--primary)] gap-1">
                            <Star size={16} className="fill-[var(--primary)]" />
                            <span className="text-2xl font-black tabular-nums tracking-tighter">
                              {faculty.overallRating > 0 ? faculty.overallRating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-on-surface-variant font-semibold">
                            {faculty.reviewCount === 1 ? '1 review' : `${faculty.reviewCount} reviews`}
                          </span>
                        </div>
                      </div>

                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
=======
>>>>>>> Stashed changes
      </div>
    );
  }

  // Next.js will prefetch this data as soon as the user hovers the RMF nav button
  return <FacultyListClient initialFaculties={data.faculties} college={data.college} />;
}
