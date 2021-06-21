export default function importScript(srcUrl) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
    script.src = srcUrl;
  });
}
