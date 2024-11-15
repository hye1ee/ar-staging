import Stats from "three/examples/jsm/libs/stats.module.js";

export default class PerformanceLogger {
  private static instance: PerformanceLogger;
  private logElement: HTMLElement;
  private stats: Stats;

  private constructor() {
    this.stats = new Stats();
    this.logElement = document.getElementById("perform-log") as HTMLDivElement;
    this.logElement.append(this.stats.dom);
  }

  // Singleton instance getter
  public static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  public updateStats() {
    this.stats.update();
  }



}
