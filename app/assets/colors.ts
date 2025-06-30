export interface ColorInterface {
  primary: string;
  secondary: string;
  main: string;
  accent: string;
  text: string;
  bg: string;
}

export interface ColorSchemeInterface {
  light: ColorInterface;
  dark: ColorInterface;
}

const DarkScheme: ColorInterface = {
  primary: "#7FC7D9",
  secondary: "#add58375",
  main: "linear-gradient(22deg, #0f375e 0%, rgba(13,31,62,1) 45%, rgba(10,39,55,1) 100%)",
  accent: "#57adbf",
  text: "#f9fcf8",
  bg: 'rgba(15,55,94,1)'
};

const LightScheme: ColorInterface = {
  primary: "#365486",
  secondary: "#31ac756a",
  main: "linear-gradient(22deg, #f1f8ff 0%, #ffffff 45%, rgba(248,253,255,1) 100%)",
  accent: "#57adbf",
  text: "#282930",
  bg:'rgba(241,248,255,1)'
};

const ColorScheme: ColorSchemeInterface = {
  dark: DarkScheme,
  light: LightScheme,
};

export default ColorScheme;
