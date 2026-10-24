if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("no3d");
// Version 1 (Original) oder 2 (Glas mit Vereinsportal): ?v=1 / ?v=2 in der Adresse, sonst die letzte Wahl
(function(){var v=null;try{v=new URLSearchParams(location.search).get("v");}catch(e){}
if(v!=="1"&&v!=="2"){try{v=localStorage.getItem("bunkerVersion");}catch(e){}}
if(v==="2")document.documentElement.classList.add("v2");})();
