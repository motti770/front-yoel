import { useState } from 'react';
import {
    Plus,
    GitBranch,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Building2
} from 'lucide-react';
import { mockWorkflows } from '../data/mockData';
import './Workflows.css';

function Workflows({ currentUser }) {
    const [expandedWorkflow, setExpandedWorkflow] = useState(null);

    const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

    return (
        <div className="workflows-page">
            <div className="page-header">
                <div className="header-info">
                    <h2>תהליכי עבודה</h2>
                    <p>{mockWorkflows.length} תהליכים</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        תהליך חדש
                    </button>
                )}
            </div>

            <div className="workflows-list">
                {mockWorkflows.map(workflow => (
                    <div key={workflow.id} className="workflow-card glass-card">
                        <div
                            className="workflow-header"
                            onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                        >
                            <div className="workflow-icon">
                                <GitBranch size={24} />
                            </div>

                            <div className="workflow-info">
                                <h3>{workflow.name}</h3>
                                <p>{workflow.description}</p>
                                <div className="workflow-meta">
                                    <span className="meta-tag code">{workflow.code}</span>
                                    <span className="meta-tag steps">{workflow.steps.length} שלבים</span>
                                    {workflow.productCount > 0 && (
                                        <span className="meta-tag products">{workflow.productCount} מוצרים</span>
                                    )}
                                </div>
                            </div>

                            <div className="workflow-status">
                                <span className={`status-badge ${workflow.isActive ? 'active' : 'inactive'}`}>
                                    {workflow.isActive ? 'פעיל' : 'לא פעיל'}
                                </span>
                            </div>

                            <button className="expand-btn">
                                {expandedWorkflow === workflow.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>

                        {expandedWorkflow === workflow.id && (
                            <div className="workflow-steps">
                                <h4>שלבי התהליך</h4>
                                <div className="steps-timeline">
                                    {workflow.steps.map((step, index) => (
                                        <div key={step.id} className="step-item">
                                            <div className="step-connector">
                                                <div className="step-number">{index + 1}</div>
                                                {index < workflow.steps.length - 1 && <div className="step-line"></div>}
                                            </div>

                                            <div className="step-content">
                                                <div className="step-header">
                                                    <h5>{step.name}</h5>
                                                    {canEdit && (
                                                        <div className="step-actions">
                                                            <button className="step-action-btn">
                                                                <GripVertical size={16} />
                                                            </button>
                                                            <button className="step-action-btn">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className="step-action-btn danger">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="step-details">
                                                    <div
                                                        className="dept-badge"
                                                        style={{
                                                            background: `${step.department.color}20`,
                                                            color: step.department.color
                                                        }}
                                                    >
                                                        <Building2 size={14} />
                                                        {step.department.name}
                                                    </div>
                                                    <span className="duration">{step.estimatedDurationDays} ימים</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {canEdit && (
                                    <button className="add-step-btn">
                                        <Plus size={16} />
                                        הוסף שלב
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Workflows;
