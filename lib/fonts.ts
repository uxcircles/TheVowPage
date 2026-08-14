import { Chiron_Sung_HK } from "next/font/google";

// Shared so every "The Vow Page 摯頁" wordmark uses the same brand serif
// instead of some spots falling back to the plain body sans font.
export const headingFont = Chiron_Sung_HK({ subsets: ["latin"], weight: ["500", "600"] });
