// Importação de ficheiros como texto (Vite/Vitest: sufixo ?raw).
declare module '*?raw' {
  const content: string
  export default content
}
