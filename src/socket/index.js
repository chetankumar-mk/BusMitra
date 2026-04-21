const { Server } = require("socket.io");
const Bus = require("../models/Bus.model");
const LocationLog = require("../models/LocationLog.model");
const { firebaseDB } = require("../firebase_admin");

let io;

const initSocket = (server, clientOrigin) => {
  io = new Server(server, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    socket.on("driver:join", (busId) => {
      socket.join(`bus_${busId}`);
    });

    socket.on("driver:location", async ({ busId, lat, lng }) => {
      try {
        const timestamp = new Date();
        
        await Bus.findByIdAndUpdate(busId, {
          $set: {
            "lastLocation.lat": lat,
            "lastLocation.lng": lng,
            "lastLocation.updatedAt": timestamp
          }
        });

        // STEP 2: Log history permanently for audit/trips
        await LocationLog.create({
          busId,
          lat,
          lng,
          timestamp
        });
        console.log(`📡 [Socket] Location Update for ${busId}: ${lat}, ${lng}`);

        // 🔥 STEP 3: SYNC TO FIREBASE (Realtime Database) for live map
        // We use .update to avoid overwriting busNumber/routeName
        if (firebaseDB) {
          await firebaseDB.ref(`buses/${busId}`).update({
            lat,
            lng,
            isActive: true,
            updatedAt: timestamp.getTime()
          });
        }

        io.to(`bus_${busId}`).emit("bus:location", {
          busId,
          lat,
          lng,
          timestamp
        });
      } catch (error) {
        console.error("Socket error: could not update bus location in MongoDB - ", error);
      }
    });

    socket.on("driver:trip_ended", (busId) => {
      io.to(`bus_${busId}`).emit("bus:trip_ended", { busId });
    });

    socket.on("passenger:track", (busId) => {
      socket.join(`bus_${busId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
