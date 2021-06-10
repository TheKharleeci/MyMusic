import { Helper, constants, ApiError } from '../../utils';
import { PlaylistService } from '../../services';

const {
  getPlaylist,
  getPlaylistOwner,
  getPlaylistLikes,
  getPlaylistById
} = PlaylistService;

const { errorResponse } = Helper;
const {
  RESOURCE_NOT_EXISTS,
  RESOURCE_EXISTS,
  RESOURCE_EXISTS_VERIFICATION_FAIL,
  RESOURCE_EXISTS_VERIFICATION_FAIL_MSG,
} = constants;

/**
 * A collection of middleware methods for the user's playlist
 * of requests through protected routes.
 *
 * @class PlaylistMiddleware
 */
class PlaylistMiddleware {
  /**
   * Validates users playlist name, with emphasis on the
   * existence of a playlist with the provided name and userId.
   * @static
   * @param { Object } req - The request from the endpoint.
   * @param { Object } res - The response returned by the method.
   * @param { function } next - Calls the next handle.
   * @returns { JSON | Null } - Returns error response if validation fails or Null if otherwise.
   * @memberof PlaylistMiddleware
   *
   */
  static async checkIfPlaylistNameExist(req, res, next) {
    try {
      const playlist = await getPlaylist(req.query.name, req.user.id);
      req.playlist = playlist;
      return playlist
        ? next()
        : errorResponse(req, res, new ApiError({ status: 409, message: RESOURCE_NOT_EXISTS('Playlist') }));
    } catch (e) {
      e.status = RESOURCE_EXISTS_VERIFICATION_FAIL('Playlist');
      Helper.moduleErrLogMessager(e);
      errorResponse(
        req,
        res,
        new ApiError({ message: RESOURCE_EXISTS_VERIFICATION_FAIL_MSG('Playlist') })
      );
    }
  }

  static async checkIfPlaylistExist(req, res, next) {
    try {
      const playlist = await getPlaylistById(req.params.id || req.query.playlistId);
      return playlist
        ? next()
        : errorResponse(req, res, new ApiError({ status: 409, message: RESOURCE_NOT_EXISTS('Playlist') }));
    } catch (e) {
      e.status = RESOURCE_EXISTS_VERIFICATION_FAIL('Playlist');
      Helper.moduleErrLogMessager(e);
      errorResponse(
        req,
        res,
        new ApiError({ message: RESOURCE_EXISTS_VERIFICATION_FAIL_MSG('Playlist') })
      );
    }
  }

  /**
   * Validates users playlist name, with emphasis on the
   * existence of a playlist with the provided name and userId.
   * @static
   * @param { Object } req - The request from the endpoint.
   * @param { Object } res - The response returned by the method.
   * @param { function } next - Calls the next handle.
   * @returns { JSON | Null } - Returns error response if validation fails or Null if otherwise.
   * @memberof PlaylistMiddleware
   *
   */
  static async checkUniquePlaylistName(req, res, next) {
    try {
      const playlist = await getPlaylist(req.body.playlistName.trim(), req.user.id);
      return playlist
        ? errorResponse(req, res, new ApiError({ status: 409, message: RESOURCE_EXISTS('Playlist') }))
        : next();
    } catch (e) {
      e.status = RESOURCE_EXISTS_VERIFICATION_FAIL('Playlist');
      Helper.moduleErrLogMessager(e);
      errorResponse(
        req,
        res,
        new ApiError({ message: RESOURCE_EXISTS_VERIFICATION_FAIL_MSG('Playlist') })
      );
    }
  }

  static async checkPlaylistOwner(req, res, next) {
    try {
      const owner = await getPlaylistOwner(req.query.playlistId, req.user.id);
      return owner
        ? next()
        : errorResponse(req, res, new ApiError({ status: 409, message: RESOURCE_EXISTS('Playlist') }));
    } catch (e) {
      e.status = RESOURCE_EXISTS_VERIFICATION_FAIL('Playlist');
      Helper.moduleErrLogMessager(e);
      errorResponse(
        req,
        res,
        new ApiError({ message: RESOURCE_EXISTS_VERIFICATION_FAIL_MSG('Playlist') })
      );
    }
  }

  static async checkUniqueDecision(req, res, next) {
    try {
      const decision = await getPlaylistLikes(req.params.id, req.user.id);
      if (decision && decision === req.body.decision) {
        req.decision = 'neutral';
        return next();
      }
      req.decision = req.body.decision;
      return next();
    } catch (e) {
      e.status = RESOURCE_EXISTS_VERIFICATION_FAIL('Playlist');
      Helper.moduleErrLogMessager(e);
      errorResponse(
        req,
        res,
        new ApiError({ message: RESOURCE_EXISTS_VERIFICATION_FAIL_MSG('Playlist') })
      );
    }
  }
}
export default PlaylistMiddleware;
