export default class DebugLogger {
  private static instance: DebugLogger;
  private logElement: HTMLElement;

  private constructor() {
    // 화면에 로그를 표시할 요소 생성 및 스타일 적용
    this.logElement = document.getElementById("debug-log") as HTMLDivElement;
    // this.logElement.id = "debug-log";

    // this.logElement.style.position = "absolute";
    // this.logElement.style.top = "0";
    // this.logElement.style.left = "0";
    // this.logElement.style.width = "calc(100% - 20px)";
    // this.logElement.style.height = "200px";
    // this.logElement.style.overflowY = "auto";
    // this.logElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    // this.logElement.style.color = "white";
    // this.logElement.style.fontSize = "12px";
    // this.logElement.style.padding = "10px";
    // this.logElement.style.zIndex = "1000"; // Ensure it's on top

    // const rootElement = document.getElementById("react-ui") as HTMLDivElement;
    // rootElement.appendChild(this.logElement);
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
    const formattedMessage =
      typeof message === "object" ? `${JSON.stringify(message)}` : message;
    this.logElement.innerText += `${formattedMessage}\n`;
    this.logElement.scrollTop = this.logElement.scrollHeight; // 자동 스크롤
  }

  // 화면에 표시된 로그 초기화
  public clear(): void {
    this.logElement.innerText = "";
  }

  public toggleVisibility(): void {
    if (this.logElement.style.opacity === "1")
      this.logElement.style.opacity = "0";
    else this.logElement.style.opacity = "1";
  }

  public init() {
    this.logElement = document.getElementById("debug-log") as HTMLDivElement;
  }
}
