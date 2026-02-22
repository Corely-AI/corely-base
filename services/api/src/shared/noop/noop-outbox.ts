export class NoopOutbox {
  async enqueue(): Promise<void> {
    // intentionally no-op (CorelyBase Lite: no worker)
  }
}
