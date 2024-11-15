export default class AlertLogger {
  private static instance: AlertLogger;
  private logElement: HTMLElement;
  private timeout: number | null = null;

  private constructor() {
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
    if (this.timeout) return;
    this.logElement.textContent = message;
    this.logElement.style.top = "30px"; // 화면에 표시
    this.logElement.style.opacity = "1";

    this.timeout = setTimeout(() => {
      this.logElement.style.top = "15px"; // 위로 이동해 사라짐
      this.logElement.style.opacity = "0";
      this.timeout = null;
    }, 2000);
  }

}
