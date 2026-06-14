'use client';

import { useState, useEffect } from 'react';
import { Badge, Card, Avatar, useToast } from '@/components/ui';
import { userEndpoints, apiGet, apiPost } from '@/config/api';

export default function AdminVerifyDoctorsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await apiGet(userEndpoints.doctorRequests());
      setRequests(res.requests || []);
    } catch (err) {
      console.log('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, doctorName) => {
    try {
      await apiPost(userEndpoints.approveDoctor({ id: requestId }), { remark: 'Approved by admin' });
      toast?.showToast(`Dr. ${doctorName} can now sign in to the portal`, 'success', 'Doctor Approved');
      fetchRequests();
    } catch (err) {
      toast?.showToast(err.message || 'Failed to approve doctor', 'error', 'Approval Failed');
    }
  };

  const handleReject = async (requestId, doctorName) => {
    try {
      await apiPost(userEndpoints.rejectDoctor({ id: requestId }), { remark: 'Rejected by admin' });
      toast?.showToast(`Dr. ${doctorName}'s request was rejected`, 'warning', 'Doctor Rejected');
      fetchRequests();
    } catch (err) {
      toast?.showToast(err.message || 'Failed to reject doctor', 'error', 'Rejection Failed');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
        Loading requests...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Doctor Verification Requests
      </div>

      {requests.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No requests
            </div>
            <div style={{ fontSize: 14 }}>New doctor registrations will appear here</div>
          </div>
        </Card>
      ) : (
        requests.map((r) => (
          <Card key={r._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar name={r.name} size={44} color="sky" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{r.experience}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--muted)',
                      marginTop: 2,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    License: {r.licenseNumber}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Email: {r.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Phone: {r.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge text={r.status} />
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleApprove(r._id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--sage)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(r._id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1.5px solid var(--rose)',
                        background: 'transparent',
                        color: 'var(--rose)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
