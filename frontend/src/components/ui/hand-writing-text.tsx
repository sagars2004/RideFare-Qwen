"use client";

import { motion, Variants } from "framer-motion";
interface HandWrittenTitleProps {
    title?: string;
    subtitle?: string;
}

function HandWrittenTitle({
    title = "Hand Written",
    subtitle = "",
}: HandWrittenTitleProps) {
    const draw: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] },
                opacity: { duration: 0.2 },
            },
        },
    };

    return (
        <div className="relative w-max py-2">
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <motion.svg
                    width="320"
                    height="100"
                    viewBox="0 0 320 100"
                    initial="hidden"
                    animate="visible"
                    className="absolute -left-[40px]"
                >
                    <title>KokonutUI</title>
                    <motion.path
                        d="M 160 15 
                           C 260 10, 310 30, 310 50 
                           C 310 75, 260 95, 160 95 
                           C 60 95, 10 75, 10 50 
                           C 10 25, 60 15, 160 15
                           C 200 15, 240 20, 240 20"
                        fill="none"
                        strokeWidth="6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="text-black opacity-90"
                    />
                </motion.svg>
            </div>
            <div className="relative z-10 flex flex-col items-start justify-center">
                <motion.h1
                    className="text-[56px] font-bold leading-tight tracking-[-0.04em] text-black flex items-center gap-2"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0 }}
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        className="text-xl text-black/80 dark:text-white/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
}

export { HandWrittenTitle }
