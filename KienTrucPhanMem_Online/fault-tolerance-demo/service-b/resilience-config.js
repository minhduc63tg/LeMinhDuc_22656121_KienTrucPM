const {
  retry,
  handleAll,
  circuitBreaker,
  SamplingBreaker,
  bulkhead,
  timeout,
  TimeoutStrategy,
  ExponentialBackoff,
  wrap,
} = require("cockatiel");

// 1. RETRY Policy - exponential backoff
const retryPolicy = retry(handleAll, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff({ maxDelay: 1000 }),
});

// 2. CIRCUIT BREAKER Policy (50% failure rate, min 5 rps, half-open after 10s)
const circuitBreakerPolicy = circuitBreaker(handleAll, {
  halfOpenAfter: 10_000,
  breaker: new SamplingBreaker({
    threshold: 0.5, // 50% failure rate
    duration: 10_000,
    minimumRps: 5,
  }),
});

// 3. BULKHEAD Policy - giới hạn concurrent requests
const bulkheadPolicy = bulkhead(5, 10); // 5 concurrent, 10 queue

// 4. TIMEOUT Policy
const timeoutPolicy = timeout(5000, TimeoutStrategy.Aggressive); // 5 seconds

// 5. Kết hợp tất cả policies
const combinedPolicy = wrap(
  retryPolicy,
  circuitBreakerPolicy,
  timeoutPolicy,
  bulkheadPolicy,
);

module.exports = {
  retryPolicy,
  circuitBreakerPolicy,
  bulkheadPolicy,
  timeoutPolicy,
  combinedPolicy,
};
