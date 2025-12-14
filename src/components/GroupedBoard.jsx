import { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Plus,
    MoreHorizontal,
    GripVertical,
    Edit2,
    Trash2,
    Palette,
    Check,
    Eye,
    EyeOff
} from 'lucide-react';
import './GroupedBoard.css';

// Color palette for groups
const GROUP_COLORS = [
    '#667eea', '#764ba2', '#f5576c', '#4facfe', '#00f2fe',
    '#fee140', '#fbc531', '#e84393', '#00cec9', '#6c5ce7',
    '#fd79a8', '#a29bfe', '#55a3ff', '#ff6b6b', '#1dd1a1'
];

function GroupedBoard({
    items = [],
    groups = [],
    onGroupsChange,
    onItemGroupChange,
    renderItem,
    renderHeader,
    itemIdField = 'id',
    language = 'he',
    emptyStateIcon,
    emptyStateText,
    showHideEmptyToggle = true  // Show hide empty groups toggle
}) {
    const [localGroups, setLocalGroups] = useState(groups);
    const [editingGroup, setEditingGroup] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverGroup, setDragOverGroup] = useState(null);
    const [showNewGroupInput, setShowNewGroupInput] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [hideEmptyGroups, setHideEmptyGroups] = useState(true); // Hide empty groups by default

    useEffect(() => {
        setLocalGroups(groups);
    }, [groups]);

    // Get items for a specific group
    const getGroupItems = (groupId) => {
        const group = localGroups.find(g => g.id === groupId);
        if (!group) return [];
        return items.filter(item => group.itemIds?.includes(item[itemIdField]));
    };

    // Get ungrouped items
    const getUngroupedItems = () => {
        const allGroupedIds = localGroups.flatMap(g => g.itemIds || []);
        return items.filter(item => !allGroupedIds.includes(item[itemIdField]));
    };

    // Filter groups based on hideEmptyGroups setting
    const visibleGroups = hideEmptyGroups
        ? localGroups.filter(g => getGroupItems(g.id).length > 0)
        : localGroups;

    // Toggle group collapse
    const toggleCollapse = (groupId) => {
        const updatedGroups = localGroups.map(g =>
            g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
        );
        setLocalGroups(updatedGroups);
        onGroupsChange?.(updatedGroups);
    };

    // Rename group
    const handleRenameGroup = (groupId, newName) => {
        if (!newName.trim()) return;
        const updatedGroups = localGroups.map(g =>
            g.id === groupId ? { ...g, name: newName } : g
        );
        setLocalGroups(updatedGroups);
        onGroupsChange?.(updatedGroups);
        setEditingGroup(null);
    };

    // Change group color
    const handleColorChange = (groupId, color) => {
        const updatedGroups = localGroups.map(g =>
            g.id === groupId ? { ...g, color } : g
        );
        setLocalGroups(updatedGroups);
        onGroupsChange?.(updatedGroups);
        setShowColorPicker(null);
    };

    // Delete group (items become ungrouped)
    const handleDeleteGroup = (groupId) => {
        const updatedGroups = localGroups.filter(g => g.id !== groupId);
        setLocalGroups(updatedGroups);
        onGroupsChange?.(updatedGroups);
    };

    // Add new group
    const handleAddGroup = () => {
        if (!newGroupName.trim()) return;
        const newGroup = {
            id: `group-${Date.now()}`,
            name: newGroupName,
            color: GROUP_COLORS[localGroups.length % GROUP_COLORS.length],
            itemIds: [],
            collapsed: false
        };
        const updatedGroups = [...localGroups, newGroup];
        setLocalGroups(updatedGroups);
        onGroupsChange?.(updatedGroups);
        setNewGroupName('');
        setShowNewGroupInput(false);
    };

    // Drag & Drop handlers
    const handleDragStart = (e, itemId) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e, groupId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverGroup(groupId);
    };

    const handleDragLeave = () => {
        setDragOverGroup(null);
    };

    const handleDrop = (e, targetGroupId) => {
        e.preventDefault();
        if (!draggedItem) return;

        // Remove from all groups
        let updatedGroups = localGroups.map(g => ({
            ...g,
            itemIds: (g.itemIds || []).filter(id => id !== draggedItem)
        }));

        // Add to target group (if not "ungrouped")
        if (targetGroupId !== 'ungrouped') {
            updatedGroups = updatedGroups.map(g =>
                g.id === targetGroupId
                    ? { ...g, itemIds: [...(g.itemIds || []), draggedItem] }
                    : g
            );
        }

        setLocalGroups(updatedGroups);
        onGroupsChange?.(updatedGroups);
        onItemGroupChange?.(draggedItem, targetGroupId);
        setDraggedItem(null);
        setDragOverGroup(null);
    };

    // Render group header
    const renderGroupHeader = (group, itemCount) => (
        <div
            className="group-header"
            style={{ '--group-color': group.color }}
        >
            <button
                className="group-collapse-btn"
                onClick={() => toggleCollapse(group.id)}
            >
                {group.collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </button>

            <div className="group-color-bar" style={{ background: group.color }} />

            {editingGroup === group.id ? (
                <input
                    type="text"
                    className="group-name-input"
                    defaultValue={group.name}
                    autoFocus
                    onBlur={(e) => handleRenameGroup(group.id, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameGroup(group.id, e.target.value);
                        if (e.key === 'Escape') setEditingGroup(null);
                    }}
                />
            ) : (
                <span
                    className="group-name"
                    onDoubleClick={() => setEditingGroup(group.id)}
                    style={{ color: group.color }}
                >
                    {group.name}
                </span>
            )}

            <span className="group-count">{itemCount} {language === 'he' ? 'פריטים' : 'items'}</span>

            <div className="group-actions">
                <button
                    className="group-action-btn"
                    onClick={() => setShowColorPicker(showColorPicker === group.id ? null : group.id)}
                    title={language === 'he' ? 'שנה צבע' : 'Change color'}
                >
                    <Palette size={14} />
                </button>
                <button
                    className="group-action-btn"
                    onClick={() => setEditingGroup(group.id)}
                    title={language === 'he' ? 'שנה שם' : 'Rename'}
                >
                    <Edit2 size={14} />
                </button>
                <button
                    className="group-action-btn danger"
                    onClick={() => handleDeleteGroup(group.id)}
                    title={language === 'he' ? 'מחק קבוצה' : 'Delete group'}
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Color Picker Dropdown */}
            {showColorPicker === group.id && (
                <div className="color-picker-dropdown">
                    {GROUP_COLORS.map(color => (
                        <button
                            key={color}
                            className={`color-option ${group.color === color ? 'selected' : ''}`}
                            style={{ background: color }}
                            onClick={() => handleColorChange(group.id, color)}
                        >
                            {group.color === color && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // Render items within a group
    const renderGroupItems = (groupItems, groupId) => (
        <div className="group-items">
            {groupItems.map(item => (
                <div
                    key={item[itemIdField]}
                    className={`group-item ${draggedItem === item[itemIdField] ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item[itemIdField])}
                >
                    <div className="item-drag-handle">
                        <GripVertical size={14} />
                    </div>
                    {renderItem(item)}
                </div>
            ))}
        </div>
    );

    return (
        <div className="grouped-board">
            {/* Custom header if provided */}
            {renderHeader && renderHeader()}

            {/* Hide Empty Groups Toggle */}
            {showHideEmptyToggle && localGroups.length > 0 && (
                <div className="groups-toolbar">
                    <button
                        className={`hide-empty-btn ${hideEmptyGroups ? 'active' : ''}`}
                        onClick={() => setHideEmptyGroups(!hideEmptyGroups)}
                    >
                        {hideEmptyGroups ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span>
                            {hideEmptyGroups
                                ? (language === 'he' ? 'הצג קבוצות ריקות' : 'Show empty groups')
                                : (language === 'he' ? 'הסתר קבוצות ריקות' : 'Hide empty groups')
                            }
                        </span>
                    </button>
                    {hideEmptyGroups && visibleGroups.length < localGroups.length && (
                        <span className="hidden-groups-count">
                            ({localGroups.length - visibleGroups.length} {language === 'he' ? 'קבוצות מוסתרות' : 'hidden'})
                        </span>
                    )}
                </div>
            )}

            {/* Groups */}
            {visibleGroups.map(group => {
                const groupItems = getGroupItems(group.id);
                return (
                    <div
                        key={group.id}
                        className={`group-section ${dragOverGroup === group.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, group.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, group.id)}
                    >
                        {renderGroupHeader(group, groupItems.length)}

                        {!group.collapsed && (
                            <>
                                {groupItems.length > 0 ? (
                                    renderGroupItems(groupItems, group.id)
                                ) : (
                                    <div className="group-empty">
                                        <span>{language === 'he' ? 'גרור פריטים לכאן' : 'Drag items here'}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}

            {/* Ungrouped Items */}
            {getUngroupedItems().length > 0 && (
                <div
                    className={`group-section ungrouped ${dragOverGroup === 'ungrouped' ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 'ungrouped')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'ungrouped')}
                >
                    <div className="group-header ungrouped-header">
                        <div className="group-color-bar" style={{ background: '#8888a0' }} />
                        <span className="group-name" style={{ color: '#8888a0' }}>
                            {language === 'he' ? 'ללא קבוצה' : 'Ungrouped'}
                        </span>
                        <span className="group-count">
                            {getUngroupedItems().length} {language === 'he' ? 'פריטים' : 'items'}
                        </span>
                    </div>
                    {renderGroupItems(getUngroupedItems(), 'ungrouped')}
                </div>
            )}

            {/* Add New Group */}
            {showNewGroupInput ? (
                <div className="new-group-input-container">
                    <input
                        type="text"
                        className="new-group-input"
                        placeholder={language === 'he' ? 'שם הקבוצה...' : 'Group name...'}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddGroup();
                            if (e.key === 'Escape') setShowNewGroupInput(false);
                        }}
                        autoFocus
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleAddGroup}>
                        <Check size={14} />
                    </button>
                </div>
            ) : (
                <button
                    className="add-group-btn"
                    onClick={() => setShowNewGroupInput(true)}
                >
                    <Plus size={16} />
                    {language === 'he' ? 'הוסף קבוצה' : 'Add Group'}
                </button>
            )}

            {/* Empty State */}
            {items.length === 0 && (
                <div className="board-empty-state">
                    {emptyStateIcon}
                    <p>{emptyStateText || (language === 'he' ? 'אין פריטים' : 'No items')}</p>
                </div>
            )}
        </div>
    );
}

export default GroupedBoard;
