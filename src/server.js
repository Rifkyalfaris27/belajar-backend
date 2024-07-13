require("dotenv").config();

const Hapi = require("@hapi/hapi");

const albums = require("./api/albums");
const songs = require("./api/songs");
const AlbumsService = require("./services/postgres/AlbumsService");
const AlbumValidator = require("./validator/albums");
const SongsService = require("./services/postgres/SongsService");
const SongValidator = require("./validator/songs");
const ClientError = require("./exeptions/ClientError");
// import Hapi from "@hapi/hapi";

// import AlbumService from "./services/inMemory/AlbumsService.js";
// import { albumsPlugin } from "./api/albums/index.js";
// import AlbumValidator from "./validator/albums/index.js";
// import { songsPlugin } from "./api/songs/index.js";
// import SongService from "./services/inMemory/SongsService.js";
// import SongValidator from "./validator/songs/index.js";
// import ClientError from "./exeptions/ClientError.js";

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // server.route(routes);
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();