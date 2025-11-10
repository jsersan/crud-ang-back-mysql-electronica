// backEnd/services/keep-alive.service.js

const http = require('http');
const https = require('https');
const { URL } = require('url');

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
    this.pingCount = 0;
    this.lastPingTime = null;
    this.failedPings = 0;
    this.PING_INTERVAL = 14 * 60 * 1000; // 14 minutos
    this.MAX_FAILED_PINGS = 3;
  }

  start() {
    if (this.isActive) {
      console.log('⚠️  Keep-alive ya está activo');
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('ℹ️  Keep-alive desactivado en desarrollo');
      return;
    }

    console.log('🚀 Iniciando servicio Keep-Alive...');
    console.log(`   Intervalo: ${this.PING_INTERVAL / 60000} minutos`);

    this.isActive = true;
    this.performPing();

    this.intervalId = setInterval(() => {
      this.performPing();
    }, this.PING_INTERVAL);

    console.log('✅ Keep-Alive activado correctamente');
  }

  stop() {
    if (!this.isActive) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isActive = false;
    console.log('🛑 Keep-Alive detenido');
  }

  async performPing() {
    try {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const urlObj = new URL(`${baseUrl}/health`);

      console.log(`🔄 [Keep-Alive] Ping #${this.pingCount + 1} a ${urlObj.href}`);

      const protocol = urlObj.protocol === 'https:' ? https : http;

      await new Promise((resolve, reject) => {
        const req = protocol.get({
          hostname: urlObj.hostname,
          port: urlObj.port,
          path: urlObj.pathname,
          headers: {
            'X-Keep-Alive': 'true',
            'User-Agent': 'KeepAlive/1.0'
          },
          timeout: 10000
        }, (res) => {
          this.pingCount++;
          this.failedPings = 0;
          this.lastPingTime = new Date();

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ [Keep-Alive] Ping exitoso`);
          } else {
            console.warn(`⚠️  [Keep-Alive] HTTP ${res.statusCode}`);
          }

          res.on('data', () => {});
          res.on('end', resolve);
        });

        req.on('error', (err) => {
          this.handleFailedPing();
          reject(err);
        });

        req.on('timeout', () => {
          req.destroy();
          this.handleFailedPing();
          reject(new Error('Timeout'));
        });
      });

    } catch (error) {
      console.error('❌ [Keep-Alive] Error:', error.message);
    }
  }

  handleFailedPing() {
    this.failedPings++;
    if (this.failedPings >= this.MAX_FAILED_PINGS) {
      console.error(`🚨 [Keep-Alive] ${this.failedPings} pings fallidos consecutivos`);
    }
  }

  getStats() {
    return {
      isActive: this.isActive,
      totalPings: this.pingCount,
      lastPingTime: this.lastPingTime,
      failedPings: this.failedPings,
      intervalMinutes: this.PING_INTERVAL / 60000
    };
  }

  isRunning() {
    return this.isActive;
  }
}

module.exports = new KeepAliveService();