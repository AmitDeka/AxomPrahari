import { db } from './src/config/db.config.js';
import * as NotificationModel from './src/models/notification.model.js';

async function runVerification() {
  console.log('--- Starting Notification System Verification ---');
  try {
    // 1. Create a notification scoped to police_admin, Kamrup Metropolitan
    console.log('1. Creating mock notifications...');
    const n1 = await NotificationModel.createNotification({
      recipientRole: 'police_admin',
      jurisdictionDistrict: 'Kamrup Metropolitan',
      title: 'Mock Over-speeding Violation',
      message: 'Vehicle AS01AA1111 reported for over-speeding at Khanapara.',
      type: 'new_report',
      relatedId: 9999
    });
    console.log('   Notification 1 created: ID =', n1.id);

    const n2 = await NotificationModel.createNotification({
      recipientRole: 'super_admin',
      jurisdictionDistrict: null,
      title: 'Mock Security Configuration Alert',
      message: 'Admin account admin@axomprahari.gov.in was modified.',
      type: 'settings_change',
      relatedId: 8888
    });
    console.log('   Notification 2 created: ID =', n2.id);

    // 2. Fetch notifications for Police Admin in Kamrup Metropolitan
    console.log('\n2. Fetching notifications for Police Admin (Kamrup Metropolitan)...');
    const listPoliceKamrup = await NotificationModel.getNotificationsForAdmin('police_admin', 'Kamrup Metropolitan');
    console.log('   Found', listPoliceKamrup.length, 'notifications');
    const foundN1 = listPoliceKamrup.find(n => n.id === n1.id);
    if (foundN1) {
      console.log('   ✅ PASS: Police Admin in Kamrup Metropolitan saw Notification 1');
    } else {
      console.log('   ❌ FAIL: Police Admin in Kamrup Metropolitan did not see Notification 1');
    }
    const foundN2 = listPoliceKamrup.find(n => n.id === n2.id);
    if (!foundN2) {
      console.log('   ✅ PASS: Police Admin in Kamrup Metropolitan did not see Super Admin notification 2');
    } else {
      console.log('   ❌ FAIL: Police Admin in Kamrup Metropolitan saw Super Admin notification 2');
    }

    // 3. Fetch notifications for Police Admin in Jorhat (should NOT see n1)
    console.log('\n3. Fetching notifications for Police Admin (Jorhat)...');
    const listPoliceJorhat = await NotificationModel.getNotificationsForAdmin('police_admin', 'Jorhat');
    const foundN1InJorhat = listPoliceJorhat.find(n => n.id === n1.id);
    if (!foundN1InJorhat) {
      console.log('   ✅ PASS: Police Admin in Jorhat did not see Notification 1 (Scoped to Kamrup)');
    } else {
      console.log('   ❌ FAIL: Police Admin in Jorhat saw Notification 1 (Scoped to Kamrup)');
    }

    // 4. Fetch notifications for Super Admin (should see both)
    console.log('\n4. Fetching notifications for Super Admin...');
    const listSuper = await NotificationModel.getNotificationsForAdmin('super_admin');
    const foundN1InSuper = listSuper.find(n => n.id === n1.id);
    const foundN2InSuper = listSuper.find(n => n.id === n2.id);
    if (foundN1InSuper && foundN2InSuper) {
      console.log('   ✅ PASS: Super Admin saw both notifications');
    } else {
      console.log('   ❌ FAIL: Super Admin missed some notifications');
    }

    // 5. Mark Notification 1 as read
    console.log('\n5. Marking Notification 1 as read...');
    const readResult = await NotificationModel.markNotificationAsRead(n1.id);
    console.log('   Marked result:', readResult);
    if (readResult.is_read) {
      console.log('   ✅ PASS: Notification 1 successfully marked as read');
    } else {
      console.log('   ❌ FAIL: Notification 1 read status not updated');
    }

    // 6. Clean up mock notifications
    console.log('\n6. Cleaning up mock data...');
    await db.query('DELETE FROM admin_notifications WHERE id IN ($1, $2)', [n1.id, n2.id]);
    console.log('   Clean up completed.');

    console.log('\n--- Verification Finished Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Verification encountered an error:', err);
    process.exit(1);
  }
}

runVerification();
