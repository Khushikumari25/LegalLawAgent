const Report = require('../models/Report.model');
const Case = require('../models/Case.model');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const ConfidenceCalculator = require('../utils/confidenceScore');
const pdfService = require('../services/pdf.service');
const path = require('path');
const fs = require('fs');

exports.generateReport = async (req, res, next) => {
  try {
    const { reportTitle, reportType, caseId, format, ipcBnsData } = req.body;

    let content = { summary: '', sections: [] };
    let linkedCase = null;

    // If IPC-BNS comparison data is provided directly, generate comparison report
    if (reportType === 'IPC-BNS Comparison' && ipcBnsData) {
      content = generateIPCBNSComparisonReport(ipcBnsData);
    } else {
      if (caseId) {
        linkedCase = await Case.findById(caseId);
      }
      if (!linkedCase) {
        linkedCase = await Case.findOne({ uploadedBy: req.user.id, 'aiAnalysis.analyzed': true })
          .sort({ updatedAt: -1 });
      }

      if (linkedCase) {
        content = generateDetailedReport(linkedCase, reportType);
      } else {
        content = generateGenericReport(reportTitle, reportType);
      }
    }

    const report = await Report.create({
      reportTitle: reportTitle || content.title || 'Legal Intelligence Report',
      reportType,
      caseId: linkedCase?._id || caseId || undefined,
      generatedBy: req.user.id,
      format: format || 'PDF',
      status: 'Generating',
      content
    });

    // Generate real PDF file
    try {
      const pdfResult = await pdfService.generatePDF(content, report._id.toString());
      report.filePath = pdfResult.filepath;
      report.fileSize = pdfResult.size;
      report.status = 'Completed';
      await report.save();
      logger.info(`Report PDF generated: ${report._id} (${pdfResult.size} bytes)`);
    } catch (pdfError) {
      logger.warn(`PDF generation failed, report saved without file: ${pdfError.message}`);
      report.status = 'Completed';
      await report.save();
    }

    logger.info(`Report generated: ${report._id} (type: ${reportType})`);
    return ApiResponse.created(res, { report }, 'Report generated successfully');
  } catch (error) {
    logger.error(`Generate report error: ${error.message}`);
    next(error);
  }
};

/**
 * Generate a detailed legal intelligence report from case data
 */
function generateDetailedReport(caseDoc, reportType) {
  const ai = caseDoc.aiAnalysis || {};
  const pe = caseDoc.petitionEligibility || {};
  const ipcSections = caseDoc.ipcSections || [];
  const bnsMappings = caseDoc.bnsMappings || [];
  const confidence = ConfidenceCalculator.calculateCaseConfidence(caseDoc, ai);

  const sections = [];

  // Section 1: Executive Summary
  sections.push({
    title: 'Executive Summary',
    content: ai.summary || `This report presents the AI-powered legal intelligence analysis of case "${caseDoc.caseTitle}" (FIR: ${caseDoc.firNumber}), filed at ${caseDoc.policeStation || 'N/A'} police station, ${caseDoc.state || 'N/A'}. The case is classified as ${caseDoc.caseType || 'N/A'} and is currently ${caseDoc.caseStatus || 'Pending'}.`
  });

  // Section 2: Case Facts
  sections.push({
    title: 'Facts of Case',
    content: `Case Title: ${caseDoc.caseTitle}\nFIR Number: ${caseDoc.firNumber}\nPolice Station: ${caseDoc.policeStation || 'N/A'}\nCourt: ${caseDoc.court || 'N/A'}\nState: ${caseDoc.state || 'N/A'}\nCase Type: ${caseDoc.caseType || 'N/A'}\nDate Filed: ${caseDoc.createdAt ? new Date(caseDoc.createdAt).toLocaleDateString() : 'N/A'}\nCurrent Status: ${caseDoc.caseStatus || 'Pending'}`
  });

  // Section 3: IPC Sections
  if (ipcSections.length > 0) {
    sections.push({
      title: 'Applicable IPC Sections',
      content: ipcSections.map(s => `Section ${s.section}${s.description ? ': ' + s.description : ''}`).join('\n')
    });
  }

  // Section 4: BNS Mapping
  if (bnsMappings.length > 0) {
    sections.push({
      title: 'IPC to BNS Transition Mapping',
      content: bnsMappings.map(m => `IPC ${m.ipcSection} → BNS ${m.bnsSection}${m.description ? ' (' + m.description + ')' : ''}`).join('\n')
    });
  }

  // Section 5: Risk Assessment
  sections.push({
    title: 'Risk Assessment',
    content: `Risk Level: ${ai.riskLevel || 'Not assessed'}\nRetrial Probability: ${ai.retrialProbability || 0}%\n\n${ai.riskLevel === 'High' ? 'This case involves serious charges that require immediate legal attention. Bail strategy should be prioritized.' : ai.riskLevel === 'Medium' ? 'This case has moderate risk factors. Careful preparation of defense is recommended.' : 'This case presents low risk indicators. Standard legal procedures apply.'}`
  });

  // Section 6: Confidence Metrics
  sections.push({
    title: 'AI Confidence Metrics',
    content: `Overall Confidence: ${(confidence.overall * 100).toFixed(1)}%\nClassification Confidence: ${(confidence.classification * 100).toFixed(1)}%\nMapping Confidence: ${(confidence.mapping * 100).toFixed(1)}%\n\nThese scores reflect the AI system's certainty in its analysis based on data completeness, document quality, and section identification accuracy.`
  });

  // Section 7: Petition Eligibility
  if (pe.score > 0 || pe.eligible !== undefined) {
    sections.push({
      title: 'Petition Eligibility Assessment',
      content: `Eligible: ${pe.eligible ? 'Yes' : 'No'}\nEligibility Score: ${pe.score || 0}/100\nReasoning: ${pe.reasoning || 'Based on case merits and procedural compliance.'}\n\nRecommendations:\n${(pe.recommendations || ['Consult qualified legal practitioner']).map(r => '- ' + r).join('\n')}`
    });
  }

  // Section 8: Key Findings
  if (ai.keyFindings && ai.keyFindings.length > 0) {
    sections.push({
      title: 'Key Findings',
      content: ai.keyFindings.map(f => '- ' + f).join('\n')
    });
  }

  // Section 9: Legal Insights
  if (ai.legalInsights && ai.legalInsights.length > 0) {
    sections.push({
      title: 'Legal Insights & Recommendations',
      content: ai.legalInsights.map(i => '- ' + i).join('\n')
    });
  }

  // Section 10: Recommended Actions
  sections.push({
    title: 'Recommended Next Steps',
    content: generateRecommendations(caseDoc, ai, pe)
  });

  return {
    summary: sections[0].content,
    sections,
    title: `Legal Intelligence Report: ${caseDoc.caseTitle}`
  };
}

function generateRecommendations(caseDoc, ai, pe) {
  const steps = [];
  steps.push('1. Review all case documents thoroughly and verify extracted information');
  steps.push('2. Confirm IPC sections and verify BNS equivalents with latest amendments');

  if (ai.riskLevel === 'High') {
    steps.push('3. Engage senior counsel immediately for case strategy');
    steps.push('4. Prepare bail application if applicable');
    steps.push('5. Identify and preserve all evidence');
  } else {
    steps.push('3. Prepare comprehensive defense documentation');
    steps.push('4. Research similar precedents for case strategy');
    steps.push('5. File necessary applications within statutory timelines');
  }

  if (pe.eligible) {
    steps.push('6. Consider filing petition at earliest opportunity');
  }

  steps.push(`${steps.length + 1}. Monitor case progress and court dates`);
  steps.push(`${steps.length + 1}. Maintain communication with client and update on developments`);

  return steps.join('\n');
}

function generateIPCBNSComparisonReport(m) {
  const title = `IPC Section ${m.ipcSection} vs BNS Section ${m.bnsSection} — Detailed Comparison`;
  const sections = [
    {
      title: 'Overview',
      content: `This report provides a detailed comparison between IPC Section ${m.ipcSection} (Indian Penal Code, 1860) and its equivalent BNS Section ${m.bnsSection} (Bharatiya Nyaya Sanhita, 2023). The BNS replaced the IPC effective July 1, 2024.`
    },
    {
      title: `IPC Section ${m.ipcSection} — Indian Penal Code`,
      content: `Description: ${m.ipcDescription || 'N/A'}\n\nPunishment: ${m.ipcPunishment || 'N/A'}\n\nThis section was part of the Indian Penal Code, 1860, which governed criminal law in India for over 160 years.`
    },
    {
      title: `BNS Section ${m.bnsSection} — Bharatiya Nyaya Sanhita`,
      content: `Description: ${m.bnsDescription || 'N/A'}\n\nPunishment: ${m.bnsPunishment || 'N/A'}\n\nThis is the corresponding section under the Bharatiya Nyaya Sanhita, 2023, which modernizes Indian criminal law.`
    },
    {
      title: 'Mapping Analysis',
      content: `Mapping Type: ${m.mappingType || 'Direct'}\n\nKey Changes: ${m.changes || 'No major substantive changes noted.'}\n\nThe transition from IPC to BNS involves renumbering and in some cases, modification of provisions to align with contemporary legal standards.`
    },
    {
      title: 'Practical Implications',
      content: `1. All pending cases filed under IPC ${m.ipcSection} will be read with reference to BNS ${m.bnsSection}.\n2. New FIRs filed after July 1, 2024 must cite BNS ${m.bnsSection}.\n3. Punishment provisions ${m.mappingType === 'Modified' ? 'have been modified — verify latest amendments' : 'remain substantially similar'}.\n4. Legal practitioners should update their pleadings and citations accordingly.`
    },
    {
      title: 'Recommendation',
      content: `Legal professionals handling cases involving IPC Section ${m.ipcSection} should:\n- Update all references to BNS Section ${m.bnsSection}\n- Review any modifications in punishment or procedure\n- Check for transitional provisions applicable to pending cases\n- Consult the official gazette notification for exact effective dates`
    }
  ];

  return {
    title,
    summary: `Comparison of IPC Section ${m.ipcSection} (${m.ipcDescription || ''}) with BNS Section ${m.bnsSection} (${m.bnsDescription || ''}). Mapping type: ${m.mappingType || 'Direct'}.`,
    sections
  };
}

function generateGenericReport(title, type) {
  return {
    summary: `${type} report generated. Upload and analyze a case to get detailed AI-powered legal intelligence.`,
    sections: [
      { title: 'Overview', content: `This is a ${type} report. For detailed analysis, upload case documents and run AI analysis first.` },
      { title: 'Recommendation', content: 'Upload a case with FIR, charge sheet, or court orders to generate a comprehensive legal intelligence report.' }
    ],
    title: title || `${type} Report`
  };
}

exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ generatedBy: req.user.id }).sort({ createdAt: -1 });
    return ApiResponse.success(res, { reports }, 'Reports retrieved');
  } catch (error) { next(error); }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return ApiResponse.notFound(res, 'Report not found');
    return ApiResponse.success(res, { report }, 'Report retrieved');
  } catch (error) { next(error); }
};

exports.downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return ApiResponse.notFound(res, 'Report not found');

    // If PDF file exists, serve it
    if (report.filePath && fs.existsSync(report.filePath)) {
      report.downloadCount += 1;
      await report.save();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportTitle.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf"`);
      const fileStream = fs.createReadStream(report.filePath);
      return fileStream.pipe(res);
    }

    // If no file, return the report content as JSON (fallback)
    report.downloadCount += 1;
    await report.save();
    return ApiResponse.success(res, { report }, 'Report content (PDF not available, regenerate to create PDF)');
  } catch (error) { next(error); }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return ApiResponse.notFound(res, 'Report not found');
    await report.deleteOne();
    return ApiResponse.success(res, null, 'Report deleted');
  } catch (error) { next(error); }
};

exports.getReportTemplates = async (req, res, next) => {
  try {
    const templates = [
      { id: 1, name: 'Case Analysis Report', type: 'Case Analysis' },
      { id: 2, name: 'IPC-BNS Comparison Report', type: 'IPC-BNS Comparison' },
      { id: 3, name: 'Petition Eligibility Report', type: 'Petition Eligibility' },
      { id: 4, name: 'Analytics Summary Report', type: 'Analytics Summary' }
    ];
    return ApiResponse.success(res, { templates }, 'Templates retrieved');
  } catch (error) { next(error); }
};
