import * as ReportModel from '../models/report.model.js';
import * as ViolationModel from '../models/violation.model.js';

export const submitReport = async (req, res) => {
  try {
    // 1. Ensure profile is complete
    if (req.user.status !== 'complete') {
      return res.status(403).json({
        status: 'error',
        message: 'You must complete your profile before reporting a violation.'
      });
    }

    const { violation_id } = req.body;

    // 2. Validate that the violation ID exists in violation master
    const violation = await ViolationModel.getViolationById(violation_id);
    if (!violation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid violation type.'
      });
    }

    const newReport = await ReportModel.createReport(req.user.id, req.body);
    
    const { getReadableMediaUrl } = await import('../utils/s3.util.js');
    const resolvedReport = {
      ...newReport,
      media_url: await getReadableMediaUrl(newReport.media_url)
    };

    res.status(201).json({
      status: 'success',
      message: 'Violation reported successfully. Status is currently pending review.',
      data: resolvedReport
    });
  } catch (error) {
    console.error('[submitReport Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCitizenReportsList = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const { status } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { reports, totalCount } = await ReportModel.getCitizenReports(
      citizenId,
      status || null,
      limit,
      offset
    );

    const { getReadableMediaUrl } = await import('../utils/s3.util.js');
    const resolvedReports = await Promise.all(
      reports.map(async (r) => ({
        ...r,
        media_url: await getReadableMediaUrl(r.media_url)
      }))
    );

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 'success',
      data: {
        reports: resolvedReports,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('[getCitizenReportsList Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAdminReportsList = async (req, res) => {
  try {
    const { status } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { reports, totalCount } = await ReportModel.getAdminReports(
      status || null,
      limit,
      offset
    );

    const { getReadableMediaUrl } = await import('../utils/s3.util.js');
    const resolvedReports = await Promise.all(
      reports.map(async (r) => ({
        ...r,
        media_url: await getReadableMediaUrl(r.media_url)
      }))
    );

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 'success',
      data: {
        reports: resolvedReports,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('[getAdminReportsList Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, admin_message } = req.body;

    const updatedReport = await ReportModel.updateReportStatus(
      reportId,
      status,
      admin_message
    );

    if (!updatedReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Violation report not found.'
      });
    }

    const { getReadableMediaUrl } = await import('../utils/s3.util.js');
    const resolvedReport = {
      ...updatedReport,
      media_url: await getReadableMediaUrl(updatedReport.media_url)
    };

    res.status(200).json({
      status: 'success',
      message: `Report has been successfully ${status}.`,
      data: resolvedReport
    });
  } catch (error) {
    console.error('[reviewReport Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    const points = await ReportModel.getHeatmapData();
    res.status(200).json({
      status: 'success',
      data: points
    });
  } catch (error) {
    console.error('[getHeatmap Error]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
