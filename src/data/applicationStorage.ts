import { StudentApplication, ApplicationStatus, DocumentType, DocumentItem, PaymentDetails } from '../types';
import { INITIAL_APPLICATIONS, DEFAULT_REQUIRED_DOCUMENTS } from './mockApplications';
import { isCloudMode, readCloudCache, writeCloudCache, pushNewApplication, pushApplicationUpdate } from '../services/applicationSync';

const STORAGE_KEY = 'chinastudy_applications_v1';
const ACTIVE_APP_KEY = 'chinastudy_active_app_id';

export const getStoredApplications = (): StudentApplication[] => {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS;
  // Production: real applications from the database (no sample data)
  if (isCloudMode()) return readCloudCache();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load applications from localStorage', e);
    return INITIAL_APPLICATIONS;
  }
};

export const saveApplications = (apps: StudentApplication[]): void => {
  if (typeof window === 'undefined') return;
  if (isCloudMode()) {
    writeCloudCache(apps);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new Event('chinastudy_applications_updated'));
  } catch (e) {
    console.error('Failed to save applications to localStorage', e);
  }
};

export const getActiveApplicationId = (): string => {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS[0].id;
  try {
    const active = localStorage.getItem(ACTIVE_APP_KEY);
    if (active) return active;
  } catch (e) {
    // fallback
  }
  const apps = getStoredApplications();
  return apps[0]?.id || (isCloudMode() ? '' : INITIAL_APPLICATIONS[0]?.id || `CSC-${new Date().getFullYear()}-78210`);
};

export const setActiveApplicationId = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_APP_KEY, id);
    window.dispatchEvent(new Event('chinastudy_active_app_updated'));
  } catch (e) {
    console.error('Failed to set active application id', e);
  }
};

export const getApplicationById = (id: string): StudentApplication | undefined => {
  const apps = getStoredApplications();
  return apps.find(a => a.id === id);
};

export const createNewApplication = (application: StudentApplication): void => {
  const apps = getStoredApplications();
  const updated = [application, ...apps.filter(a => a.id !== application.id)];
  saveApplications(updated);
  setActiveApplicationId(application.id);
};

/** Production: create the application in the database and wait for the result. */
export const createNewApplicationAsync = async (application: StudentApplication): Promise<boolean> => {
  createNewApplication(application);
  return pushNewApplication(application);
};

export const updateApplication = (id: string, updater: (app: StudentApplication) => StudentApplication): StudentApplication | undefined => {
  const apps = getStoredApplications();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) return undefined;

  const updatedApp = updater({ ...apps[index], updatedAt: new Date().toISOString() });
  apps[index] = updatedApp;
  saveApplications(apps);
  if (isCloudMode()) void pushApplicationUpdate(updatedApp);
  return updatedApp;
};

export const updateApplicationStatus = (
  id: string,
  newStatus: ApplicationStatus,
  adminNote?: string
): StudentApplication | undefined => {
  return updateApplication(id, (app) => {
    // Update timeline
    const updatedTimeline = [...app.timeline];
    
    // Check if timeline event should be added or updated
    const statusTitles: Record<ApplicationStatus, string> = {
      deposit_pending: 'Stage 1: Initial Deposit Pending ($515)',
      deposit_paid: 'Application Created & Initial Deposit Paid ($515)',
      document_review: 'Credentials & Document Verification',
      university_submitted: `Dossier Submitted: ${app.preferences.specificProgram || app.preferences.preferredField || 'Academic Admissions Committee'}`,
      interview_evaluation: 'Academic Faculty Review / Interview Assessment',
      admission_granted: 'Official Academic Admission Notice Issued! 🎉',
      admission_payment_pending: 'Stage 2: Admission Payment Pending ($858)',
      jw202_issued: 'JW202 / JW201 Visa Form Ready 📄',
      final_payment_pending: 'Stage 3: Final Payment Pending ($1,716)',
      visa_preparation: 'Chinese Embassy Student Visa (X1/X2) Filing',
      pre_departure: 'Pre-Departure, Housing & China Arrival',
    };

    const statusDescriptions: Record<ApplicationStatus, string> = {
      deposit_pending: 'Stage 1 initial deposit ($515 USD) pending before application processing begins.',
      deposit_paid: 'Stage 1 initial deposit ($515 USD) recorded. Senior admissions counselor assigned to review dossier.',
      document_review: 'Admissions team is auditing transcripts, passport, and certificates.',
      university_submitted: 'Dossier successfully registered in the official academic admission portal.',
      interview_evaluation: 'Department faculty committee reviewing academic merit.',
      admission_granted: 'Admission offer finalized! Stage 2 payment ($858 USD) unlocked.',
      admission_payment_pending: 'Stage 2 admission payment ($858 USD) unlocked after admission confirmation.',
      jw202_issued: 'Ministry of Education electronic visa certificate code issued. Stage 3 payment ($1,716 USD) unlocked.',
      final_payment_pending: 'Stage 3 final payment ($1,716 USD) unlocked after JW202/JW201 issuance.',
      visa_preparation: 'Foreigner physical exam & visa submission checklist active.',
      pre_departure: 'Student visa received. Dormitory booked and arrival liaison coordinated.',
    };

    // Mark current timeline event
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = updatedTimeline.findIndex(t => t.title.includes(statusTitles[newStatus]?.substring(0, 15) || ''));

    if (existingIndex >= 0) {
      updatedTimeline[existingIndex].completed = true;
      updatedTimeline[existingIndex].current = true;
      updatedTimeline[existingIndex].date = today;
    } else {
      updatedTimeline.push({
        id: `tl-${Date.now()}`,
        title: statusTitles[newStatus],
        description: statusDescriptions[newStatus],
        date: today,
        completed: true,
        current: true,
      });
    }

    // Set previous current to false
    updatedTimeline.forEach(t => {
      if (t.title !== statusTitles[newStatus]) {
        t.current = false;
      }
    });

    let admissionNotice = app.admissionNotice;
    if (newStatus === 'admission_granted' && !admissionNotice) {
      admissionNotice = {
        program: app.preferences.specificProgram || `${app.preferences.targetDegree} Degree Program`,
        intake: app.preferences.intakeSeason || 'Autumn Intake',
        issueDate: today,
        studentRegistrationNo: `INT-${Math.floor(10000 + Math.random() * 90000)}`,
      };
    }

    let jw202Form = app.jw202Form;
    if (newStatus === 'jw202_issued' && !jw202Form) {
      jw202Form = {
        formNumber: `JW202-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        formType: 'JW202',
        visaType: 'X1',
        validUntil: 'Valid for 6 Months',
        issueDate: today,
        authorizedDuration: 'Standard Degree Length',
      };
    }

    const messages = [...app.messages];
    if (adminNote) {
      messages.push({
        id: `msg-${Date.now()}`,
        sender: 'advisor',
        senderName: app.advisor.name,
        content: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}: ${adminNote}`,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      ...app,
      status: newStatus,
      timeline: updatedTimeline,
      admissionNotice,
      jw202Form,
      messages,
      adminNotes: adminNote ? `${app.adminNotes ? app.adminNotes + '\n' : ''}[${today}] ${adminNote}` : app.adminNotes,
    };
  });
};

export const updateDocumentStatus = (
  appId: string,
  docId: string,
  status: DocumentItem['status'],
  feedback?: string
): StudentApplication | undefined => {
  return updateApplication(appId, (app) => {
    const updatedDocs = app.documents.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status,
          feedback: feedback || doc.feedback,
        };
      }
      return doc;
    });

    return {
      ...app,
      documents: updatedDocs,
    };
  });
};

export const uploadOrReplaceDocument = (
  appId: string,
  docType: DocumentType,
  fileMeta: { name: string; size: string; url?: string; storagePath?: string }
): StudentApplication | undefined => {
  return updateApplication(appId, (app) => {
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = app.documents.findIndex(d => d.type === docType);

    let updatedDocs: DocumentItem[];
    if (existingIndex >= 0) {
      updatedDocs = [...app.documents];
      updatedDocs[existingIndex] = {
        ...updatedDocs[existingIndex],
        name: fileMeta.name,
        fileSize: fileMeta.size,
        uploadDate: today,
        status: 'pending',
        feedback: undefined,
        fileUrl: fileMeta.url || updatedDocs[existingIndex].fileUrl,
        storagePath: fileMeta.storagePath || updatedDocs[existingIndex].storagePath,
        receivedAt: undefined,
        receivedBy: undefined,
      };
    } else {
      const template = DEFAULT_REQUIRED_DOCUMENTS.find(d => d.type === docType);
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        type: docType,
        title: template ? template.title : docType.replace('_', ' ').toUpperCase(),
        description: template ? template.description : 'Uploaded applicant document',
        required: template ? template.required : false,
        name: fileMeta.name,
        fileSize: fileMeta.size,
        uploadDate: today,
        status: 'pending',
        fileUrl: fileMeta.url,
        storagePath: fileMeta.storagePath,
      };
      updatedDocs = [...app.documents, newDoc];
    }

    return {
      ...app,
      documents: updatedDocs,
    };
  });
};

export const recordPayment = (
  appId: string,
  stage: 'deposit' | 'admissionPayment' | 'finalPayment',
  details: Partial<PaymentDetails>
): StudentApplication | undefined => {
  return updateApplication(appId, (app) => {
    const today = new Date().toISOString().split('T')[0];
    const prefix = stage === 'deposit' ? 'DEP' : stage === 'admissionPayment' ? 'ADM' : 'BAL';
    const txnId = details.transactionId || `TXN-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const recNo = details.receiptNumber || `REC-SIC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const isPaid = details.paid ?? true;
    const updatedPayment = {
      ...app.payments[stage],
      ...details,
      paid: isPaid,
      status: (isPaid ? 'paid' : 'pending') as 'paid' | 'pending',
      date: details.date || today,
      transactionId: txnId,
      receiptNumber: recNo,
    };

    let nextStatus = app.status;
    if (isPaid) {
      if (stage === 'deposit' && (app.status === 'deposit_paid' || app.status === 'deposit_pending')) {
        nextStatus = 'document_review';
      } else if (stage === 'admissionPayment') {
        nextStatus = 'jw202_issued';
      } else if (stage === 'finalPayment') {
        nextStatus = 'visa_preparation';
      }
    } else if (stage === 'deposit' && app.status === 'document_review') {
      nextStatus = 'deposit_pending';
    }

    return {
      ...app,
      status: nextStatus,
      payments: {
        ...app.payments,
        [stage]: updatedPayment,
      },
    };
  });
};

export const addAdvisorMessage = (
  appId: string,
  sender: 'advisor' | 'student',
  senderName: string,
  content: string
): StudentApplication | undefined => {
  return updateApplication(appId, (app) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      content,
      timestamp: new Date().toISOString(),
    };
    return {
      ...app,
      messages: [...app.messages, newMessage],
    };
  });
};

/** Admissions team confirms receipt of a document: visible in the student's dashboard + message. */
export const acknowledgeDocument = (
  appId: string,
  docId: string,
  staffName: string
): StudentApplication | undefined => {
  return updateApplication(appId, (app) => {
    const doc = app.documents.find(d => d.id === docId);
    if (!doc) return app;
    const now = new Date().toISOString();
    return {
      ...app,
      documents: app.documents.map(d => (d.id === docId ? { ...d, receivedAt: now, receivedBy: staffName } : d)),
      messages: [
        ...app.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'advisor',
          senderName: staffName,
          content: `Acknowledgment of receipt: we have received your document "${doc.title}"${doc.name ? ` (${doc.name})` : ''}. Our team will review it and let you know if anything is needed.`,
          timestamp: now,
        },
      ],
    };
  });
};
