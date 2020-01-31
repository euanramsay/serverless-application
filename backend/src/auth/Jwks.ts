/**
 * Interface representing a JWT token
 */
export interface Jwks {
    keys: Key[];
}

export interface Key {
    alg: string;
    kty: string;
    use: string;
    n: string;
    e: string;
    kid: string;
    x5t: string;
    x5c: string[];
}
