import * as FeedbackModel from '../models/feedback.model.js';
import * as UserModel from '../models/user.model.js';
import { getReadableMediaUrl } from '../utils/s3.util.js';

export const submitFeedback = async (req, res) => {
  try {
    if (req.user?.is_demo || req.user?.phone_number === '6000026296') {
      return res.status(403).json({
        status: 'error',
        message: 'Feedback submission is disabled for the demo account to prevent test data submission.'
      });
    }

    const userId = req.user.id;
    const { citizen_id, feedback_category, message, image_key, image_url } = req.body;

    // 1. Ensure profile is complete
    if (req.user.status !== 'complete') {
      return res.status(403).json({
        status: 'error',
        message: 'You must complete your profile before submitting feedback.'
      });
    }

    // 2. Fetch user profile from database to get their true custom citizen_id
    const dbUser = await UserModel.getUserProfileById(userId);
    if (!dbUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Citizen profile not found.'
      });
    }

    // 3. Verify that the body citizen_id matches the logged-in citizen's identifier
    if (dbUser.citizen_id !== citizen_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Citizen ID does not match your authenticated profile.'
      });
    }

    // 4. Determine image URL
    let resolvedImageUrl = image_url || null;
    if (image_key) {
      const customDomain = process.env.R2_CUSTOM_DOMAIN || 'pub-r2.axomprahari.in';
      resolvedImageUrl = `https://${customDomain}/${image_key}`;
    }

    // 5. Create feedback record
    const newFeedback = await FeedbackModel.createFeedback(userId, {
      feedback_category,
      message,
      image_url: resolvedImageUrl
    });

    // 6. Resolve key/URL into a readable download link if private
    const readableImageUrl = newFeedback.image_url 
      ? await getReadableMediaUrl(newFeedback.image_url) 
      : null;

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully.',
      data: {
        id: newFeedback.id,
        citizen_id: dbUser.citizen_id,
        feedback_category: newFeedback.feedback_category,
        message: newFeedback.message,
        image_url: readableImageUrl,
        created_at: newFeedback.created_at
      }
    });
  } catch (error) {
    console.error('[submitFeedback Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { feedbacks, total } = await FeedbackModel.getFeedbacksList(limit, offset);

    const isSuperAdmin = req.user.role === 'super_admin';
    // Resolve private/public media links for all feedbacks
    const resolvedFeedbacks = await Promise.all(
      feedbacks.map(async (fb) => {
        const readableUrl = fb.image_url 
          ? await getReadableMediaUrl(fb.image_url) 
          : null;

        let name = fb.citizen_name;
        let phone = fb.citizen_phone;
        let email = fb.citizen_email;

        if (!isSuperAdmin) {
          if (name) {
            name = name.split(' ').map(p => p.length <= 2 ? p[0] + '*' : p[0] + '*'.repeat(p.length - 2) + p[p.length - 1]).join(' ');
          }
          if (phone) {
            phone = phone.replace(/(\+\d{2})?\d{6}(\d{4})/, (m, country, last) => `${country || ''}******${last}`);
          }
          if (email && email.includes('@')) {
            const [local, domain] = email.split('@');
            email = local.length <= 2 ? `${local[0] || '*'}*@${domain}` : `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
          }
        }

        return {
          id: fb.id,
          feedback_category: fb.feedback_category,
          message: fb.message,
          image_url: readableUrl,
          created_at: fb.created_at,
          citizen: {
            name,
            phone,
            email,
            code: fb.citizen_code
          }
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        feedbacks: resolvedFeedbacks,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('[getFeedbacks Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
