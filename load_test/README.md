# StyleLease Concurrent Login Load & Stress Testing Suite

This suite is located outside both frontend and backend (`load_test/`). It provides **real, authentic concurrent HTTP load testing** that demonstrates how multiple virtual users concurrently authenticate against the StyleLease API server, verifying concurrency handling, throughput (RPS), and latency percentiles (p50, p90, p95, p99).

---

## 🚀 Option 1: Terminal CLI Benchmark (With ANSI Metrics Dashboard)

Run the standalone CLI benchmark from the project root:

```bash
# Default: 20 concurrent virtual users, 60 requests
node load_test/concurrent_login_tester.js

# Custom concurrency and request volume:
node load_test/concurrent_login_tester.js --concurrency 30 --requests 100
```

### What it does:
1. Opens real TCP HTTP/1.1 socket connections to `http://localhost:5000/api/auth/login`.
2. Spawns an asynchronous worker pool simulating `N` virtual users in parallel.
3. Authenticates real accounts in MongoDB with Bcrypt verification and validates real JWT signatures.
4. Uses high-resolution hardware timers (`performance.now()`) to measure millisecond latencies.
5. Displays a live progress bar, active virtual user gauge, real-time requests/sec (RPS), and a full ASCII latency histogram.
6. Automatically saves an audit report in `load_test/results/concurrency_run_<timestamp>.json`.

---

## 🌐 Option 2: Standalone Interactive Browser Visualizer

Open `load_test/dashboard.html` in any web browser (Chrome, Edge, Firefox):

- **Interactive Sliders**: Adjust concurrent virtual users (5 to 60 VUs) and total request count.
- **Live Canvas Chart**: 60fps real-time latency timeline graph.
- **Metric Dials**: Real-time RPS, active worker count, p50 latency, and success rates.
- **Terminal Log Stream**: Inspect live HTTP status codes and JWT token fragments for every virtual user.
