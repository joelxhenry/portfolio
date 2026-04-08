export interface ColorInterface {
  primary: string;
  secondary: string;
  main: string;
  accent: string;
  text: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
}

export interface ColorSchemeInterface {
  light: ColorInterface;
  dark: ColorInterface;
}

const DarkScheme: ColorInterface = {
  primary: "#c8e64e",
  secondary: "rgba(200, 230, 78, 0.25)",
  main: "linear-gradient(160deg, #0a0a0a 0%, #111111 45%, #0d0d0d 100%)",
  accent: "#c8e64e",
  text: "#f0f0f0",
  bg: "rgba(10, 10, 10, 1)",
  cardBg: "rgba(30, 30, 30, 0.6)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
};

const LightScheme: ColorInterface = {
  primary: "#3d6b2e",
  secondary: "rgba(61, 107, 46, 0.12)",
  main: "linear-gradient(160deg, #f7f6f2 0%, #fafaf7 45%, #f4f3ef 100%)",
  accent: "#5a8f47",
  text: "#1a1a1a",
  bg: "rgba(247, 246, 242, 1)",
  cardBg: "rgba(255, 255, 255, 0.75)",
  cardBorder: "rgba(0, 0, 0, 0.08)",
};

const ColorScheme: ColorSchemeInterface = {
  dark: DarkScheme,
  light: LightScheme,
};

export default ColorScheme;
