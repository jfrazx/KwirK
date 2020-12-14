import { TimerJobs, ITimerJobs, ITimerJobsOptions } from 'timerjobs';

export class Timer extends TimerJobs implements ITimer {}
export interface ITimer extends ITimerJobs {}
export interface ITimerOptions extends ITimerJobsOptions {}
