const UAParser = require('ua-parser-js');

const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent || '');
  const browser = parser.getBrowser().name || 'Unknown';
  const deviceType = parser.getDevice().type;
  const device = deviceType === 'mobile' || deviceType === 'tablet' ? 'Mobile' : 'Desktop';
  return { browser, device };
};

module.exports = { parseUserAgent };
