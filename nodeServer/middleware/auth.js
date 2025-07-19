import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const client = jwksClient({
  jwksUri: 'https://YOUR_DOMAIN/.well-known/jwks.json', // Replace YOUR_DOMAIN
});

// Function to get the signing key
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const checkAuthorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ success: false, msg: 'Authorization token is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    jwt.verify(
      token,
      getKey,
      {
        audience: 'https://your-api-identifier', // Replace this
        issuer: 'https://YOUR_DOMAIN/',          // Replace this
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          console.error('JWT verification error:', err);
          return res.status(401).send({ success: false, msg: 'Invalid token' });
        }

        console.log('Decoded token:', decoded);
        req.user = decoded; // Optional: attach to req
        next();
      }
    );
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).send({ success: false, msg: 'Unauthorized' });
  }
};

export { checkAuthorization };
