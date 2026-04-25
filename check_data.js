async function checkDb() {
  try {
    const res = await fetch('https://wisefungi.vercel.app/api/fungi');
    const data = await res.json();
    console.log("Current mushrooms:", Object.keys(data));
  } catch(e) {
    console.error(e);
  }
}
checkDb();
