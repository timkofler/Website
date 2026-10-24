// Gewähltes Hell/Dunkel vor dem ersten Zeichnen setzen, damit nichts aufblitzt
try { var t = localStorage.getItem("tk-shop-theme"); if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t); } catch (e) {}
