'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function AppSwitcher() {
  const pathname = usePathname();
  const { themeConfig } = useTheme();
  const { user } = useUser();
  const isPyqs = pathname.startsWith('/pyqs');

  // Try to determine user's current semester for smart redirect
  const userSemester = user?.semester ? parseInt(user.semester.replace(/[^0-9]/g, ''), 10) : null;
  const pyqLink = userSemester ? `/pyqs/${userSemester}` : '/pyqs';

  // Grab theme colors for gradients
  const primary = themeConfig.colors.primary;
  const secondary = themeConfig.colors.secondary;
  const accent = themeConfig.colors.accent;

  // "JioHotstar" style: dark center with colorful gradient border
  const InactiveButton = ({ title, isPyq }: { title: string; isPyq?: boolean }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full rounded-[18px] p-[1.5px]"
      style={{
        background: `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`
      }}
    >
      <div className="flex h-[52px] w-full items-center justify-center rounded-[17px] bg-[#0A0A0A] px-2 transition-colors hover:bg-black/90 text-white">
        <span className={cn(
          "text-[12px] sm:text-base tracking-wide whitespace-nowrap leading-none",
          isPyq ? "uppercase tracking-[0.1em]" : "font-headline font-bold"
        )} style={{ 
          fontFamily: isPyq ? 'Evaco' : 'Qelandsaightrial', 
          fontSize: isPyq ? '14px' : '18px', 
          paddingTop: isPyq ? '4px' : '2px' 
        }}>
          {title}
        </span>
      </div>
    </motion.div>
  );

  // "TADKA" style: solid vibrant gradient
  const ActiveButton = ({ title, isPyq }: { title: string; isPyq?: boolean }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-[52px] w-full items-center justify-center rounded-[18px] px-2 text-white shadow-xl shadow-primary/20"
      style={{
        background: `linear-gradient(135deg, ${secondary}, ${primary}, ${accent})`,
      }}
    >
      <span className={cn(
        "text-[12px] sm:text-base tracking-wide drop-shadow-lg whitespace-nowrap leading-none",
        isPyq ? "uppercase tracking-[0.1em]" : "font-headline font-bold"
      )} style={{ 
        fontFamily: isPyq ? 'Evaco' : 'Qelandsaightrial', 
        fontSize: isPyq ? '14px' : '18px', 
        paddingTop: isPyq ? '4px' : '2px' 
      }}>
        {title}
      </span>
    </motion.div>
  );

  return (
    <div className="flex w-full gap-3 mb-2">
      <Link href="/" className="flex-1 min-w-0 flex">
        {!isPyqs ? (
          <ActiveButton title="FcuK Academia" />
        ) : (
          <InactiveButton title="FcuK Academia" />
        )}
      </Link>

      <Link href={pyqLink} className="flex-1 min-w-0 flex">
        {isPyqs ? (
          <ActiveButton title="PYQs" isPyq />
        ) : (
          <InactiveButton title="PYQs" isPyq />
        )}
      </Link>
    </div>
  );
}

