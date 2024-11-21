export default class AlertLogger {
  private static instance: AlertLogger;
  private logElement: HTMLElement | null = null;
  private timeout: NodeJS.Timeout | null = null;

  private constructor() {
  }

  public init() {
    this.logElement = document.getElementById("alert-log") as HTMLDivElement;
  }

  // Singleton instance getter
  public static getInstance(): AlertLogger {
    if (!AlertLogger.instance) {
      AlertLogger.instance = new AlertLogger();
    }
    return AlertLogger.instance;
  }

  // 메인 alert 메서드: 메시지를 받아 화면에 표시
  public alert(message: string): void {
    if (!this.logElement) this.init();

    if (this.logElement) {
      if (this.timeout) return;
      this.logElement.textContent = message;
      this.logElement.style.top = "15px"; // 화면에 표시
      this.logElement.style.opacity = "1";

      this.timeout = setTimeout(() => {
        if (this.logElement) {
          this.logElement.style.top = "5px"; // 위로 이동해 사라짐
          this.logElement.style.opacity = "0";
        }
        this.timeout = null;
      }, 2000);
    }
  }

  public startManualAlert(message: string): void {
    if (!this.logElement) this.init();
    if (!this.logElement) return;

    this.logElement.textContent = message;
    this.logElement.style.top = "15px"; // 화면에 표시
    this.logElement.style.opacity = "1";
  }
  public endManualAlert(): void {
    if (!this.logElement) this.init();
    if (!this.logElement) return;

    this.logElement.style.top = "5px"; // 위로 이동해 사라짐
    this.logElement.style.opacity = "0";
  }

}
