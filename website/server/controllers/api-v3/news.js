import { authWithHeaders } from '../../middlewares/auth';
import { model as NewsPost } from '../../models/newsPost';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers

const worldDmg = { // @TODO
  bailey: false,
};

/**
 * @api {get} /api/v3/news Get latest Bailey announcement
 * @apiName GetNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} html Latest Bailey html
 *
 */
api.getNews = {
  method: 'GET',
  url: '/news',
  async handler (req, res) {
    const baileyClass = worldDmg.bailey ? 'npc_bailey_broken' : 'npc_bailey';

    const lastNewsPost = NewsPost.lastNewsPost();
    if (lastNewsPost) {
      res.status(200).send({
        html: `
        <div class="bailey">
          <div class="media align-items-center">
            <div class="mr-3 ${baileyClass}"></div>
            <div class="media-body">
              <h1 class="align-self-center">${res.t('newStuff')}</h1>
              <h2>${lastNewsPost.title}</h2>
            </div>
          </div>
          <hr/>
          <div class="promo_armoire_backgrounds_202005 center-block"></div>
          <p>
            ${lastNewsPost.text}
          </p>
          <div class="small">
            ${lastNewsPost.credits}
          </div>
        </div>
        `,
      });
    } else {
      res.status(200).send({
        html: `
        <div class="bailey">
          <div class="media align-items-center">
            <div class="mr-3 ${baileyClass}"></div>
            <div class="media-body">
              <h1 class="align-self-center">${res.t('newStuff')}</h1>
            </div>
          </div>
        </div>
        `,
      });
    }
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.tellMeLaterNews = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/news/tell-me-later',
  async handler (req, res) {
    const { user } = res.locals;

    const { id, title } = NewsPost.lastNewsPost();
    user.flags.lastNewStuffRead = id;

    user.addNotification('NEW_STUFF', { title: title.toUpperCase() }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
