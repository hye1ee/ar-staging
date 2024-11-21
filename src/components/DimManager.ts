
export default class DimManager {
  private static instance: DimManager;
  private dimElement: HTMLElement | null = null;

  private constructor() {
  }
  public init() {
    this.dimElement = document.getElementById("dim") as HTMLDivElement;
    if (this.dimElement) {
      this.dimElement.style.visibility = "hidden"
      this.dimElement.addEventListener("pointerdown", (e) => e.stopPropagation())
    }
  }

  // Singleton instance getter
  public static getInstance(): DimManager {
    if (!DimManager.instance) {
      DimManager.instance = new DimManager();
    }
    return DimManager.instance;
  }

  public show() {
    if (this.dimElement) this.dimElement.style.visibility = "visible"
  }

  public hide() {
    if (this.dimElement) this.dimElement.style.visibility = "hidden"
  }

}
