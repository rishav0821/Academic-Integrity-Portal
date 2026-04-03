import dotenv from 'dotenv';
dotenv.config();

const testAuth = async () => {
    try {
        // Register
        console.log("Registering test2@test.com...");
        const regRes = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", email: "test2@test.com", password: "password123" })
        });
        const regData = await regRes.json();
        console.log("Register Res:", regRes.status, regData);

        // Login
        console.log("Logging in test2@test.com...");
        const logRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test2@test.com", password: "password123" })
        });
        const logData = await logRes.json();
        console.log("Login Res:", logRes.status, logData);

    } catch (e) {
        console.error(e);
    }
};
testAuth();
