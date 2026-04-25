async function testDelete() {
  try {
    const res = await fetch('https://wisefungi.vercel.app/api/fungi?action=delete&slug=turkey_tail&secret=wise-fungi-secret', {
      method: 'GET'
    });
    
    console.log("Delete status:", res.status, await res.text());

    // Fetch and read back remaining mushrooms
    const freshRes = await fetch('https://wisefungi.vercel.app/api/fungi');
    const freshData = await freshRes.json();
    console.log("Remaining:", Object.keys(freshData).join(", "));
  } catch(e) {
    console.error(e);
  }
}
testDelete();
