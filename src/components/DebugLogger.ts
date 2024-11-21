export default class DebugLogger {
  private static instance: DebugLogger;
  private logElement: HTMLElement | null = null;

  private constructor() {
  }
  public init() {
    this.logElement = document.getElementById("debug-log") as HTMLDivElement ?? null;
  }

  // 싱글톤 인스턴스 접근 메서드
  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  // 메시지를 HTML 요소에 출력
  public log(message: any): void {
    console.log(message)
    if (!this.logElement) this.init();

    const formattedMessage =
      typeof message === "object" ? `${JSON.stringify(message)}` : message;

    if (this.logElement) {
      this.logElement.innerText += `${formattedMessage}\n`;
      this.logElement.scrollTop = this.logElement.scrollHeight; // 자동 스크롤
    }
  }

  // 화면에 표시된 로그 초기화
  public clear(): void {
    if (!this.logElement) this.init();
    if (!this.logElement) return;

    this.logElement.innerText = "";
  }

  public toggleVisibility(): void {
    if (!this.logElement) this.init();
    if (!this.logElement) return;

    if (this.logElement.style.opacity === "1")
      this.logElement.style.opacity = "0";
    else this.logElement.style.opacity = "1";
  }

}
