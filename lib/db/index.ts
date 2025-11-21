// Client-safe database exports
'use client';

import { BaseResumeRepository } from './repositories/base-resume-repository';
import { TailoredResumeRepository } from './repositories/tailored-resume-repository';

// Export repositories
export const baseResumeRepository = new BaseResumeRepository();
export const tailoredResumeRepository = new TailoredResumeRepository();

// Export types
export type { BaseResume } from './repositories/base-resume-repository';
export type { TailoredResume } from './repositories/tailored-resume-repository';
