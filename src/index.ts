import http from "node:http";

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        status: "ok",
      }),
    );

    return;
  }

  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      error: "Not Found",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`Quill server running on http://localhost:${PORT}`);
});