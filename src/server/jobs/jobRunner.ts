import { jobsRepository } from '../repositories/jobsRepository';
import type { Job, JobStatus } from '@/domain/types';

interface RunningTask {
  controller: AbortController;
  heartbeatTimer: NodeJS.Timeout;
}

class JobRunner {
  private activeTasks = new Map<string, RunningTask>();

  constructor() {
    this.cleanInterruptedJobs();
  }

  private cleanInterruptedJobs() {
    try {
      const cutoff = new Date(Date.now() - 600 * 1000).toISOString();
      jobsRepository.markInterrupted(cutoff).catch(() => {});
    } catch {}
  }

  async startJob(
    jobId: string,
    executeFn: (signal: AbortSignal, updateProgress: (stage: string, progress: number) => Promise<void>) => Promise<void>
  ): Promise<void> {
    const controller = new AbortController();

    // Start 5-second heartbeat
    const heartbeatTimer = setInterval(() => {
      jobsRepository.heartbeat(jobId).catch(() => {});
    }, 5000);

    this.activeTasks.set(jobId, { controller, heartbeatTimer });

    await jobsRepository.update(jobId, {
      status: 'running',
      startedAt: new Date().toISOString(),
      heartbeatAt: new Date().toISOString(),
    });

    const updateProgress = async (stage: string, progress: number) => {
      await jobsRepository.update(jobId, {
        stage,
        progress: Math.min(100, Math.max(0, Math.round(progress))),
        heartbeatAt: new Date().toISOString(),
      });
    };

    // Execute asynchronously
    (async () => {
      try {
        await executeFn(controller.signal, updateProgress);
        await jobsRepository.update(jobId, {
          status: 'succeeded',
          progress: 100,
          finishedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        const isCancelled = controller.signal.aborted || err.message === 'Aborted';
        const status: JobStatus = isCancelled ? 'cancelled' : 'failed';
        await jobsRepository.update(jobId, {
          status,
          finishedAt: new Date().toISOString(),
          error: {
            code: isCancelled ? 'cancelled' : 'job_error',
            message: err.message || 'Job failed',
          },
        });
      } finally {
        clearInterval(heartbeatTimer);
        this.activeTasks.delete(jobId);
      }
    })();
  }

  cancelJob(jobId: string): boolean {
    const task = this.activeTasks.get(jobId);
    if (task) {
      task.controller.abort();
      clearInterval(task.heartbeatTimer);
      this.activeTasks.delete(jobId);
      jobsRepository.update(jobId, {
        status: 'cancelled',
        finishedAt: new Date().toISOString(),
        error: { code: 'cancelled', message: 'Job was cancelled by user' },
      }).catch(() => {});
      return true;
    }
    return false;
  }
}

interface GlobalWithRunner {
  __dealDeskJobRunner?: JobRunner;
}

const globalForRunner = globalThis as unknown as GlobalWithRunner;

export const jobRunner = globalForRunner.__dealDeskJobRunner || new JobRunner();
if (process.env.NODE_ENV !== 'production') {
  globalForRunner.__dealDeskJobRunner = jobRunner;
}
