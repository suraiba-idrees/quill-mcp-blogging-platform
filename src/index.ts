import http from "node:http";

const PORT = Number(process.env.PORT || 3000);

// Server define karna zaroori hai
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Quill Server Active!");
});

server.listen(PORT, () => {
  console.log(`Quill server running on http://localhost:${PORT}`);
});


