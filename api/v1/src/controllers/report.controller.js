import * as ReportModel from '../models/report.model.js';
import * as ViolationModel from '../models/violation.model.js';
import { createNotification } from '../models/notification.model.js';

const ASSAM_DISTRICTS = [
  "Kamrup Metropolitan", "Kamrup", "Jorhat", "Dibrugarh", "Sonitpur", "Cachar", "Nagaon",
  "Sivasagar", "Tinsukia", "Dhubri", "Kokrajhar", "Goalpara", "Bongaigaon", "Barpeta",
  "Nalbari", "Darrang", "Morigaon", "Golaghat", "Karbi Anglong", "Dima Hasao", "Karimganj",
  "Hailakandi", "Lakhimpur", "Dhemaji", "Baksa", "Chirang", "Udalguri", "Majuli",
  "Charaideo", "Hojai", "Biswanath", "South Salmara-Mankachar", "West Karbi Anglong",
  "Bajali", "Tamulpur"
];

const getDistrictFromLocation = (locationName) => {
  if (!locationName) return null;
  const nameLower = locationName.toLowerCase();
  for (const district of ASSAM_DISTRICTS) {
    if (nameLower.includes(district.toLowerCase())) {
      return district;
    }
  }
  if (nameLower.includes("guwahati")) {
    return "Kamrup Metropolitan";
  }
  return null;
};

export const submitReport = async (req, res) => {
  try {
    // Defense-in-depth demo restriction
    if (req.user?.is_demo || req.user?.phone_number === '6000026296') {
      return res.status(403).json({
        status: 'error',
        message: 'Violation reporting is disabled for the demo account to prevent test data submission.'
      });
    }

    // 1. Ensure profile is complete
    if (req.user.status !== 'complete') {
      return res.status(403).json({
        status: 'error',
        message: 'You must complete your profile before reporting a violation.'
      });
    }

    const { violation_id } = req.body;

    // 2. Validate that the violation ID exists and is active in violation master
    const violation = await ViolationModel.getViolationById(violation_id);
    if (!violation || violation.is_active === false) {
      return res.status(400).json({
        status: 'error',
        message: 'This violation type is inactive or no longer accepted.'
      });
    }

    const newReport = await ReportModel.createReport(req.user.id, req.body);
    
    // Dispatch administrative notification for the new report
    try {
      const district = getDistrictFromLocation(newReport.location_name);
      await createNotification({
        recipientRole: 'police_admin',
        jurisdictionDistrict: district,
        title: 'New Incident Reported',
        message: `A new report for vehicle ${newReport.vehicle_number} (${violation.offence_name}) has been filed at ${newReport.location_name}.`,
        type: 'new_report',
        relatedId: newReport.id
      });
    } catch (notifError) {
      console.error('[Notification Hook Error in submitReport]', notifError);
    }

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

    const isSuperAdmin = req.user.role === 'super_admin';
    const { getReadableMediaUrl } = await import('../utils/s3.util.js');
    const resolvedReports = await Promise.all(
      reports.map(async (r) => {
        let citizenName = r.citizen_name;
        let phoneNumber = r.phone_number;

        if (!isSuperAdmin) {
          if (citizenName) {
            citizenName = citizenName.split(' ').map(p => p.length <= 2 ? p[0] + '*' : p[0] + '*'.repeat(p.length - 2) + p[p.length - 1]).join(' ');
          }
          if (phoneNumber) {
            phoneNumber = phoneNumber.replace(/(\+\d{2})?\d{6}(\d{4})/, (m, country, last) => `${country || ''}******${last}`);
          }
        }

        return {
          ...r,
          citizen_name: citizenName,
          phone_number: phoneNumber,
          media_url: await getReadableMediaUrl(r.media_url)
        };
      })
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

    // Check existing report status first
    const existingReport = await ReportModel.getReportById(reportId);
    if (!existingReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Violation report not found.'
      });
    }

    // SEC-18: District Jurisdiction check for Police Admins
    if (req.user.role === 'police_admin') {
      const reportDistrict = getDistrictFromLocation(existingReport.location_name);
      if (
        reportDistrict &&
        req.user.jurisdiction_district &&
        reportDistrict.toLowerCase() !== req.user.jurisdiction_district.toLowerCase()
      ) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied. You can only review reports filed in ${req.user.jurisdiction_district}.`
        });
      }
    }

    const updatedReport = await ReportModel.updateReportStatus(
      reportId,
      status,
      admin_message
    );

    // Grant reward points ONLY if transitioned to 'accepted' from a non-accepted status
    if (status === 'accepted' && existingReport.status !== 'accepted') {
      const violation = await ViolationModel.getViolationById(updatedReport.violation_id);
      if (violation && violation.reward_points > 0) {
        const UserModel = await import('../models/user.model.js');
        await UserModel.addRewardPoints(updatedReport.citizen_id, violation.reward_points);
      }
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
