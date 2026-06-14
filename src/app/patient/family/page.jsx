'use client';

import { useState, useEffect } from 'react';
import { Card, Avatar, Field, Modal, Btn, Badge, useToast, EditIcon, BinIcon } from '@/components/ui';
import { apiGet, apiPost, apiPut, familyMemberEndpoints } from '@/config/api';
import { useAppStore } from '@/lib/store-client';

const RELATIONS = ['Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];


const BloodDropIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={color} stroke="none">
    <path d="M12 2C12 2 4 12 4 16a8 8 0 0 0 16 0C20 12 12 2 12 2zm0 20a6 6 0 0 1-6-6c0-2.5 3.2-8.2 6-12.2C14.8 7.8 18 13.5 18 16a6 6 0 0 1-6 6z" />
  </svg>
);

const CakeIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
    <path d="M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M12 2v4" />
    <path d="M8 4v2" />
    <path d="M16 4v2" />
    <circle cx="12" cy="8" r="1" fill={color} />
  </svg>
);

const MaleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="13.5" r="5.5" />
    <line x1="14.5" y1="9.5" x2="21" y2="3" />
    <line x1="17" y1="3" x2="21" y2="3" />
    <line x1="21" y1="3" x2="21" y2="6" />
  </svg>
);

const FemaleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="5.5" />
    <line x1="12" y1="14.5" x2="12" y2="22" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);

const emptyForm = () => ({
  name: '',
  relation: 'Wife',
  dob: '',
  bloodGroup: 'A+',
  gender: 'Male',
});

export default function PatientFamilyPage() {
  const { showToast } = useToast();
  const { user } = useAppStore();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get today's date string for max date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch family members from API on mount
  useEffect(() => {
    let cancelled = false;
    const fetchFamilyMembers = async () => {
      try {
        setLoading(true);
        const res = await apiGet(familyMemberEndpoints.list());
        if (!cancelled) setFamilyMembers(res.data || []);
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Failed to load family members', 'error', 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFamilyMembers();
    return () => { cancelled = true; };
  }, []);

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [k]: val }));
    // Clear error for this field on change
    if (errors[k]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.relation) errs.relation = 'Relation is required';
    if (!form.dob) errs.dob = 'Date of birth is required';
    else if (form.dob > today) errs.dob = 'Date of birth cannot be in the future';
    if (!form.bloodGroup) errs.bloodGroup = 'Blood group is required';
    if (!form.gender) errs.gender = 'Gender is required';
    return errs;
  };

  const addRelationHandler = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Check for duplicate locally (same name + relation)
    const trimmedName = form.name.trim().toLowerCase();
    const isDuplicate = familyMembers.some(
      (m) => m.name?.trim().toLowerCase() === trimmedName && m.relation === form.relation
    );
    if (isDuplicate) {
      showToast('A family member with the same name and relation already exists', 'error', 'Duplicate Entry');
      return;
    }

    try {
      setSaving(true);
      const res = await apiPost(familyMemberEndpoints.add(), {
        name: form.name.trim(),
        relation: form.relation,
        bloodGroup: form.bloodGroup,
        dateOfBirth: form.dob,
        gender: form.gender,
      });
      setFamilyMembers((prev) => [...prev, res.data]);
      setShowAdd(false);
      setForm(emptyForm());
      setErrors({});
      showToast(res.message || 'Family member added successfully', 'success');
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        showToast('A family member with the same name and relation already exists', 'error', 'Duplicate Entry');
      } else {
        showToast(err.message || 'Failed to add family member', 'error', 'Error');
      }
    } finally {
      setSaving(false);
    }
  };

  const editRelationHandler = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const member = familyMembers[editIndex];
    try {
      setSaving(true);
      const res = await apiPut(familyMemberEndpoints.update({ id: member._id }), {
        name: form.name.trim(),
        relation: form.relation,
        bloodGroup: form.bloodGroup,
        dateOfBirth: form.dob,
        gender: form.gender,
      });
      setFamilyMembers((prev) =>
        prev.map((m, i) => (i === editIndex ? res.data : m))
      );
      setShowEdit(false);
      setEditIndex(null);
      setForm(emptyForm());
      setErrors({});
      showToast(res.message || 'Family member updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update family member', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (index) => {
    const member = familyMembers[index];
    setForm({
      name: member.name || '',
      relation: member.relation || 'Wife',
      dob: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      bloodGroup: member.bloodGroup || 'A+',
      gender: member.gender || 'Male',
    });
    setEditIndex(index);
    setErrors({});
    setShowEdit(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm === null) return;
    const member = familyMembers[deleteConfirm];
    try {
      setSaving(true);
      const res = await apiPost(familyMemberEndpoints.delete(), {
        userId: user?.id,
        recordId: member._id,
      });
      setFamilyMembers((prev) => prev.filter((_, i) => i !== deleteConfirm));
      setDeleteConfirm(null);
      showToast(res.message || 'Family member removed successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove family member', 'error', 'Error');
      setDeleteConfirm(null);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (index, currentStatus) => {
    if (currentStatus !== false) {
      // Trying to deactivate — show validation toast
      showToast('Family member must remain active. Deactivation is not allowed.', 'warning', 'Cannot Deactivate');
      return;
    }
    // Reactivating an inactive member
    const member = familyMembers[index];
    try {
      const res = await apiPut(familyMemberEndpoints.update({ id: member._id }), { status: true });
      setFamilyMembers((prev) =>
        prev.map((m, i) => (i === index ? { ...m, status: true } : m))
      );
      showToast(res.message || 'Family member activated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error', 'Error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{ fontSize: 16, color: 'var(--muted)' }}>Loading family members…</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic' }}>
            Family Members
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            Manage your family members and their health information
          </div>
        </div>
        <Btn onClick={() => { setForm(emptyForm()); setErrors({}); setShowAdd(true); }} disabled={saving}>
          + Add Member
        </Btn>
      </div>

      {/* Empty State */}
      {familyMembers.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink2)', marginBottom: 6 }}>
              No family members added yet
            </div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>Add family members to manage their health records</div>
            <Btn onClick={() => { setForm(emptyForm()); setErrors({}); setShowAdd(true); }} disabled={saving}>
              + Add Your First Member
            </Btn>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {familyMembers.map((r, i) => (
            <Card key={r._id || i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 22px',
              transition: 'all .18s',
              opacity: r.status === false ? 0.55 : 1,
            }}>
              {/* Avatar */}
              <Avatar name={r.name || 'Unknown'} size={48} color={r.gender === 'Male' ? 'sky' : r.gender === 'Female' ? 'rose' : 'amber'} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{r.name || 'Unknown'}</span>
                  <Badge text={r.relation} color="sage" />
                  {r.status === false && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      background: '#f0ede8',
                      padding: '2px 8px',
                      borderRadius: 12,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'var(--rose-light)',
                    color: 'var(--rose)',
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    <BloodDropIcon size={12} color="var(--rose)" />
                    {r.bloodGroup || 'N/A'}
                  </span>
                  {r.dateOfBirth && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
                      <CakeIcon size={13} color="var(--muted)" />
                      {new Date(r.dateOfBirth).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  {r.gender && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
                      {r.gender === 'Male' ? <MaleIcon size={13} color="var(--sky)" /> : r.gender === 'Female' ? <FemaleIcon size={13} color="var(--rose)" /> : null}
                      {r.gender}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Edit Button */}
                <button
                  onClick={() => openEdit(i)}
                  title="Edit member"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: '1.5px solid var(--sage-light)',
                    background: 'transparent',
                    color: 'var(--sage)',
                    cursor: 'pointer',
                    transition: 'all .18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--sage-light)';
                    e.currentTarget.style.borderColor = 'var(--sage)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--sage-light)';
                  }}
                >
                  <EditIcon size={16} color="var(--sage)" />
                </button>

                {/* Status Toggle */}
                <button
                  onClick={() => handleStatusToggle(i, r.status)}
                  title={r.status !== false ? 'Deactivate member' : 'Activate member'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: `1.5px solid ${r.status !== false ? 'var(--sage)' : 'var(--border2)'}`,
                    background: r.status !== false ? 'var(--sage-light)' : 'transparent',
                    color: r.status !== false ? 'var(--sage)' : 'var(--muted)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .18s',
                  }}
                >
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: r.status !== false ? 'var(--sage)' : 'var(--muted)',
                    transition: 'background .18s',
                  }} />
                  {r.status !== false ? 'Active' : 'Inactive'}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirm(i)}
                  title="Remove member"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: '1.5px solid var(--rose-light)',
                    background: 'transparent',
                    color: 'var(--rose)',
                    cursor: 'pointer',
                    transition: 'all .18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--rose-light)';
                    e.currentTarget.style.borderColor = 'var(--rose)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--rose-light)';
                  }}
                >
                  <BinIcon size={18} color="var(--rose)" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setErrors({}); }} title="Add Family Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Enter member's full name"
              style={errors.name ? { borderColor: 'var(--rose)' } : {}}
            />
            {errors.name && <span style={{ fontSize: 12, color: 'var(--rose)', marginTop: 2 }}>{errors.name}</span>}
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Relation" required>
              <select
                value={form.relation}
                onChange={set('relation')}
                style={errors.relation ? { borderColor: 'var(--rose)' } : {}}
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Blood Group" required>
              <select
                value={form.bloodGroup}
                onChange={set('bloodGroup')}
                style={errors.bloodGroup ? { borderColor: 'var(--rose)' } : {}}
              >
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Date of Birth" required>
              <input
                type="date"
                value={form.dob}
                onChange={set('dob')}
                max={today}
                style={errors.dob ? { borderColor: 'var(--rose)' } : {}}
              />
              {errors.dob && <span style={{ fontSize: 12, color: 'var(--rose)', marginTop: 2 }}>{errors.dob}</span>}
            </Field>
            <Field label="Gender" required>
              <select
                value={form.gender}
                onChange={set('gender')}
                style={errors.gender ? { borderColor: 'var(--rose)' } : {}}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>Status:</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'var(--sage-light)',
              color: 'var(--sage)',
              fontSize: 12,
              fontWeight: 700,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />
              Active
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
              — New members are always active
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Btn onClick={addRelationHandler} disabled={saving}>
              {saving ? 'Adding…' : 'Add Member'}
            </Btn>
            <Btn variant="ghost" onClick={() => { setShowAdd(false); setErrors({}); }} disabled={saving}>
              Cancel
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} title="Edit Family Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Enter member's full name"
              style={errors.name ? { borderColor: 'var(--rose)' } : {}}
            />
            {errors.name && <span style={{ fontSize: 12, color: 'var(--rose)', marginTop: 2 }}>{errors.name}</span>}
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Relation" required>
              <select
                value={form.relation}
                onChange={set('relation')}
                style={errors.relation ? { borderColor: 'var(--rose)' } : {}}
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Blood Group" required>
              <select
                value={form.bloodGroup}
                onChange={set('bloodGroup')}
                style={errors.bloodGroup ? { borderColor: 'var(--rose)' } : {}}
              >
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Date of Birth" required>
              <input
                type="date"
                value={form.dob}
                onChange={set('dob')}
                max={today}
                style={errors.dob ? { borderColor: 'var(--rose)' } : {}}
              />
              {errors.dob && <span style={{ fontSize: 12, color: 'var(--rose)', marginTop: 2 }}>{errors.dob}</span>}
            </Field>
            <Field label="Gender" required>
              <select
                value={form.gender}
                onChange={set('gender')}
                style={errors.gender ? { borderColor: 'var(--rose)' } : {}}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Btn onClick={editRelationHandler} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Btn>
            <Btn variant="ghost" onClick={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} disabled={saving}>
              Cancel
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Remove Family Member" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>{familyMembers[deleteConfirm]?.name || 'this member'}</strong> from your family members? This action cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Removing…' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BinIcon size={14} color="var(--rose)" /> Remove</span>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}