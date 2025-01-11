import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { BugReport } from 'exterminator-bar';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';


// Helper function to get severity badge color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'secondary';
  }
};

export default function Demo(): JSX.Element {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      import('exterminator-bar').then(({init}) => {
      init({
        callbacks: {
          onSubmit: async (report) => {
            console.log('Bug report submitted:', report);
            setReports(prev => [report, ...prev]);
            }
          }
        });
      });
    }
  }, []);

  return (
    <Layout
      title="Live Demo"
      description="Try Exterminator Bar live in your browser">
      <div className="container margin-vert--lg">
        <div className="text--center margin-bottom--xl">
          <h1>Live Demo</h1>
          <p>
            Try Exterminator Bar right here in your browser. Click the bug icon in the bottom right
            corner to start reporting a bug.
          </p>
        </div>

        <div className="row">
          <div className="col col--8 col--offset-2">
            {/* Sample UI Elements for Testing */}
            <div className="card shadow--md margin-bottom--lg">
              <div className="card__body">
                <h2>Interactive Elements</h2>
                <div className="margin-bottom--md">
                  <label className="margin-right--sm">Sample Input:</label>
                  <input type="text" placeholder="Type something..." className="margin-right--sm" />
                  <button className="button button--primary">Submit</button>
                </div>
                <div className="margin-bottom--md">
                  <div className="dropdown">
                    <button className="button button--secondary">Dropdown Menu ▼</button>
                  </div>
                </div>
                <div className="alert alert--info margin-bottom--md">
                  This is a sample alert message for testing annotations.
                </div>
                <div className="grid grid--2">
                  <div className="card">
                    <div className="card__body">
                      <h3>Card 1</h3>
                      <p>Test highlighting this content.</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card__body">
                      <h3>Card 2</h3>
                      <p>Or try annotating this section.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="card shadow--md margin-bottom--lg">
              <div className="card__body">
                <h2>Features to Try</h2>
                <ul>
                  <li>📸 Take a screenshot and annotate it</li>
                  <li>🎥 Record a short screen session</li>
                  <li>📝 Fill out the bug report form</li>
                  <li>🎯 Use the drawing tools to highlight issues</li>
                  <li>💾 Submit the report and see it appear below</li>
                </ul>
              </div>
            </div>

            {/* Submitted Reports Section */}
            <div className="card shadow--md">
              <div className="card__body">
                <h2>Submitted Bug Reports</h2>
                {reports.length === 0 ? (
                  <p className="text--center margin-vert--lg text--muted">
                    No bug reports submitted yet. Try submitting one!
                  </p>
                ) : (
                  <>
                    <div className="table-responsive margin-bottom--lg">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report, index) => (
                            <tr key={report.id || index}>
                              <td>{report.title}</td>
                              <td>
                                <span className="badge badge--secondary">
                                  {report.type}
                                </span>
                              </td>
                              <td>
                                <span className={`badge badge--${getSeverityColor(report.severity)}`}>
                                  {report.severity}
                                </span>
                              </td>
                              <td>
                                <span className="badge badge--primary">
                                  {report.status}
                                </span>
                              </td>
                              <td>{new Date(report.createdAt).toLocaleString()}</td>
                              <td>
                                <button
                                  className="button button--sm button--link"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Report Details Modal */}
                    {selectedReport && (
                      <div className="card margin-bottom--lg">
                        <div className="card__header">
                          <div className="row">
                            <div className="col">
                              <h3>{selectedReport.title}</h3>
                            </div>
                            <div className="col text--right">
                              <button
                                className="button button--sm button--secondary"
                                onClick={() => setSelectedReport(null)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="card__body">
                          <div className="margin-bottom--md">
                            <strong>Description:</strong>
                            <p>{selectedReport.description}</p>
                          </div>

                          <div className="margin-bottom--md">
                            <strong>Environment:</strong>
                            <pre>
                              {JSON.stringify(selectedReport.environment, null, 2)}
                            </pre>
                          </div>

                          {selectedReport.labels && selectedReport.labels.length > 0 && (
                            <div className="margin-bottom--md">
                              <strong>Labels:</strong>
                              <div>
                                {selectedReport.labels.map((label, i) => (
                                  <span key={i} className="badge badge--info margin-right--sm">
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedReport.visualFeedback?.screenshot && (
                            <div className="margin-bottom--md">
                              <strong>Screenshot:</strong>
                              <div className="margin-top--sm">
                                <img
                                  src={selectedReport.visualFeedback.screenshot}
                                  alt="Bug report screenshot"
                                  style={{ maxWidth: '100%', border: '1px solid #ddd' }}
                                />
                              </div>
                            </div>
                          )}

                          {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                            <div className="margin-bottom--md">
                              <strong>Attachments:</strong>
                              <ul>
                                {selectedReport.attachments.map((attachment, i) => (
                                  <li key={i}>
                                    {attachment.name} ({attachment.type})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 