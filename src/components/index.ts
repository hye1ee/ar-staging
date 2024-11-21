import AlertLogger from "@/components/AlertLogger";
import DebugLogger from "@/components/DebugLogger";
import DimManager from "@/components/DimManager";
import GuideCircle from "@/components/GuideCircle";
import PerformanceLogger from "@/components/PerformanceLogger";

// Need to be initialized before use
export const alertLogger = AlertLogger.getInstance();
export const debugLogger = DebugLogger.getInstance();
export const dimManager = DimManager.getInstance();
export const performanceLogger = PerformanceLogger.getInstance();

export const guideCircle = GuideCircle.getInstance();


// document.addEventListener("DOMContentLoaded", () => {
//   alertLogger.init();
//   debugLogger.init();
//   dimManager.init();
//   performanceLogger.init();
// });