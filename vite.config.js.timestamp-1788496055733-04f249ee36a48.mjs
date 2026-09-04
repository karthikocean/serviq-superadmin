// vite.config.js
import { defineConfig } from "file:///D:/Nivi%20folder/OFFICE%20PROJECTS/serviq-superadmin/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Nivi%20folder/OFFICE%20PROJECTS/serviq-superadmin/node_modules/@vitejs/plugin-react/dist/index.js";
import { createRequire } from "module";
var __vite_injected_original_import_meta_url = "file:///D:/Nivi%20folder/OFFICE%20PROJECTS/serviq-superadmin/vite.config.js";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var mongoose;
var bcrypt;
try {
  mongoose = require2("d:/Nivi folder/OFFICE PROJECTS/serviq-backend/node_modules/mongoose");
  bcrypt = require2("d:/Nivi folder/OFFICE PROJECTS/serviq-backend/node_modules/bcryptjs");
} catch (e) {
  console.warn("Could not load mongoose/bcryptjs from backend folder:", e.message);
}
var MONGO_URI = "mongodb+srv://oceansoftwares21:kawzsqz7PoY2VJPY@cluster0.rmscewe.mongodb.net/serviq-restaurant?retryWrites=true&w=majority";
function resetPasswordPlugin() {
  return {
    name: "reset-password-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (req.method === "POST" && (url === "/api/auth/reset-password" || url === "/api/super-admin/auth/reset-password" || url === "/api/admin/reset-password" || url === "/api/reset-password")) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            try {
              const data = JSON.parse(body || "{}");
              const identifier = String(data.email || data.phoneNumber || data.phone || "").trim().toLowerCase();
              const pin = String(data.newPassword || data.password || data.pin || "").trim();
              if (!identifier) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: "Email or phone number is required." }));
              }
              if (!pin || pin.length < 4) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: "Password must be at least 4 characters." }));
              }
              if (mongoose && bcrypt) {
                if (mongoose.connection.readyState !== 1) {
                  await mongoose.connect(MONGO_URI);
                }
                const hashedPin = await bcrypt.hash(pin, 10);
                const filter = {
                  $or: [
                    { email: identifier },
                    { phoneNumber: identifier },
                    { phone: identifier }
                  ]
                };
                const updateObj = { $set: { password: hashedPin, updatedAt: /* @__PURE__ */ new Date() } };
                await Promise.all([
                  mongoose.connection.db.collection("superadmins").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("superadminusers").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("admins").updateOne(filter, updateObj),
                  mongoose.connection.db.collection("users").updateOne(filter, updateObj)
                ]);
                res.statusCode = 200;
                return res.end(JSON.stringify({
                  success: true,
                  message: "Password reset successfully! You can now sign in."
                }));
              } else {
                res.statusCode = 200;
                return res.end(JSON.stringify({
                  success: true,
                  message: "Password reset processed."
                }));
              }
            } catch (err) {
              console.error("Error in reset password middleware:", err);
              res.statusCode = 500;
              return res.end(JSON.stringify({
                success: false,
                message: err.message || "Internal server error while resetting password."
              }));
            }
          });
          return;
        }
        if (req.method === "OPTIONS" && (url === "/api/auth/reset-password" || url === "/api/super-admin/auth/reset-password" || url === "/api/admin/reset-password" || url === "/api/reset-password")) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          return res.end();
        }
        next();
      });
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), resetPasswordPlugin()],
  server: {
    port: 3e3,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxOaXZpIGZvbGRlclxcXFxPRkZJQ0UgUFJPSkVDVFNcXFxcc2VydmlxLXN1cGVyYWRtaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXE5pdmkgZm9sZGVyXFxcXE9GRklDRSBQUk9KRUNUU1xcXFxzZXJ2aXEtc3VwZXJhZG1pblxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovTml2aSUyMGZvbGRlci9PRkZJQ0UlMjBQUk9KRUNUUy9zZXJ2aXEtc3VwZXJhZG1pbi92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbW9kdWxlJ1xuXG5jb25zdCByZXF1aXJlID0gY3JlYXRlUmVxdWlyZShpbXBvcnQubWV0YS51cmwpXG5sZXQgbW9uZ29vc2UsIGJjcnlwdFxuXG50cnkge1xuICBtb25nb29zZSA9IHJlcXVpcmUoJ2Q6L05pdmkgZm9sZGVyL09GRklDRSBQUk9KRUNUUy9zZXJ2aXEtYmFja2VuZC9ub2RlX21vZHVsZXMvbW9uZ29vc2UnKVxuICBiY3J5cHQgPSByZXF1aXJlKCdkOi9OaXZpIGZvbGRlci9PRkZJQ0UgUFJPSkVDVFMvc2VydmlxLWJhY2tlbmQvbm9kZV9tb2R1bGVzL2JjcnlwdGpzJylcbn0gY2F0Y2ggKGUpIHtcbiAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgbG9hZCBtb25nb29zZS9iY3J5cHRqcyBmcm9tIGJhY2tlbmQgZm9sZGVyOicsIGUubWVzc2FnZSlcbn1cblxuY29uc3QgTU9OR09fVVJJID0gJ21vbmdvZGIrc3J2Oi8vb2NlYW5zb2Z0d2FyZXMyMTprYXd6c3F6N1BvWTJWSlBZQGNsdXN0ZXIwLnJtc2Nld2UubW9uZ29kYi5uZXQvc2VydmlxLXJlc3RhdXJhbnQ/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5J1xuXG5mdW5jdGlvbiByZXNldFBhc3N3b3JkUGx1Z2luKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXNldC1wYXNzd29yZC1taWRkbGV3YXJlJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSByZXEudXJsID8gcmVxLnVybC5zcGxpdCgnPycpWzBdIDogJydcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJyAmJiAodXJsID09PSAnL2FwaS9hdXRoL3Jlc2V0LXBhc3N3b3JkJyB8fCB1cmwgPT09ICcvYXBpL3N1cGVyLWFkbWluL2F1dGgvcmVzZXQtcGFzc3dvcmQnIHx8IHVybCA9PT0gJy9hcGkvYWRtaW4vcmVzZXQtcGFzc3dvcmQnIHx8IHVybCA9PT0gJy9hcGkvcmVzZXQtcGFzc3dvcmQnKSkge1xuICAgICAgICAgIGxldCBib2R5ID0gJydcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7IGJvZHkgKz0gY2h1bmsgfSlcbiAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJylcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnUE9TVCwgT1BUSU9OUycpXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpXG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGJvZHkgfHwgJ3t9JylcbiAgICAgICAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IFN0cmluZyhkYXRhLmVtYWlsIHx8IGRhdGEucGhvbmVOdW1iZXIgfHwgZGF0YS5waG9uZSB8fCAnJykudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgY29uc3QgcGluID0gU3RyaW5nKGRhdGEubmV3UGFzc3dvcmQgfHwgZGF0YS5wYXNzd29yZCB8fCBkYXRhLnBpbiB8fCAnJykudHJpbSgpXG5cbiAgICAgICAgICAgICAgaWYgKCFpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDBcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnRW1haWwgb3IgcGhvbmUgbnVtYmVyIGlzIHJlcXVpcmVkLicgfSkpXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIXBpbiB8fCBwaW4ubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNCBjaGFyYWN0ZXJzLicgfSkpXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobW9uZ29vc2UgJiYgYmNyeXB0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vbmdvb3NlLmNvbm5lY3Rpb24ucmVhZHlTdGF0ZSAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgYXdhaXQgbW9uZ29vc2UuY29ubmVjdChNT05HT19VUkkpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaGVkUGluID0gYXdhaXQgYmNyeXB0Lmhhc2gocGluLCAxMClcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAkb3I6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBlbWFpbDogaWRlbnRpZmllciB9LFxuICAgICAgICAgICAgICAgICAgICB7IHBob25lTnVtYmVyOiBpZGVudGlmaWVyIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgcGhvbmU6IGlkZW50aWZpZXIgfVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZU9iaiA9IHsgJHNldDogeyBwYXNzd29yZDogaGFzaGVkUGluLCB1cGRhdGVkQXQ6IG5ldyBEYXRlKCkgfSB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgICBtb25nb29zZS5jb25uZWN0aW9uLmRiLmNvbGxlY3Rpb24oJ3N1cGVyYWRtaW5zJykudXBkYXRlT25lKGZpbHRlciwgdXBkYXRlT2JqKSxcbiAgICAgICAgICAgICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuY29sbGVjdGlvbignc3VwZXJhZG1pbnVzZXJzJykudXBkYXRlT25lKGZpbHRlciwgdXBkYXRlT2JqKSxcbiAgICAgICAgICAgICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuY29sbGVjdGlvbignYWRtaW5zJykudXBkYXRlT25lKGZpbHRlciwgdXBkYXRlT2JqKSxcbiAgICAgICAgICAgICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuY29sbGVjdGlvbigndXNlcnMnKS51cGRhdGVPbmUoZmlsdGVyLCB1cGRhdGVPYmopXG4gICAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCByZXNldCBzdWNjZXNzZnVsbHkhIFlvdSBjYW4gbm93IHNpZ24gaW4uJ1xuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCByZXNldCBwcm9jZXNzZWQuJ1xuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gcmVzZXQgcGFzc3dvcmQgbWlkZGxld2FyZTonLCBlcnIpXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSB8fCAnSW50ZXJuYWwgc2VydmVyIGVycm9yIHdoaWxlIHJlc2V0dGluZyBwYXNzd29yZC4nXG4gICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnICYmICh1cmwgPT09ICcvYXBpL2F1dGgvcmVzZXQtcGFzc3dvcmQnIHx8IHVybCA9PT0gJy9hcGkvc3VwZXItYWRtaW4vYXV0aC9yZXNldC1wYXNzd29yZCcgfHwgdXJsID09PSAnL2FwaS9hZG1pbi9yZXNldC1wYXNzd29yZCcgfHwgdXJsID09PSAnL2FwaS9yZXNldC1wYXNzd29yZCcpKSB7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKVxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnUE9TVCwgT1BUSU9OUycpXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUnKVxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjA0XG4gICAgICAgICAgcmV0dXJuIHJlcy5lbmQoKVxuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIHJlc2V0UGFzc3dvcmRQbHVnaW4oKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgaG9zdDogdHJ1ZVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4VSxTQUFTLG9CQUFvQjtBQUMzVyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxxQkFBcUI7QUFGaUwsSUFBTSwyQ0FBMkM7QUFJaFEsSUFBTUEsV0FBVSxjQUFjLHdDQUFlO0FBQzdDLElBQUk7QUFBSixJQUFjO0FBRWQsSUFBSTtBQUNGLGFBQVdBLFNBQVEscUVBQXFFO0FBQ3hGLFdBQVNBLFNBQVEscUVBQXFFO0FBQ3hGLFNBQVMsR0FBRztBQUNWLFVBQVEsS0FBSyx5REFBeUQsRUFBRSxPQUFPO0FB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
