import React from 'react';
import { FileText, Image, FolderOpen, Filter, Search } from 'lucide-react';

const Assets = ({ t, language }) => {
    const isRtl = language === 'he';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <FolderOpen className="w-6 h-6 text-blue-600" />
                        {t('assets')}
                    </h1>
                    <p className="text-gray-500">{t('assetsDescription') || 'ניהול קבצים, תמונות ומסמכים'}</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm">
                        <Filter size={18} />
                        {t('filter')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
                        <FolderOpen size={18} />
                        {t('upload') || 'העלאה'}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3 border">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={t('searchFiles') || "חיפוש קבצים..."}
                    className="flex-1 outline-none bg-transparent"
                />
            </div>

            {/* Content Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Empty State / Placeholder Items */}
                {['catalog_2024.pdf', 'logo_v2.png', 'project_specs.docx', 'design_draft.jpg'].map((file, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            {file.endsWith('.png') || file.endsWith('.jpg') ? <Image size={32} /> : <FileText size={32} />}
                        </div>
                        <h3 className="font-medium text-gray-800 truncate" dir="ltr">{file}</h3>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>2.4 MB</span>
                            <span>12/12/2024</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Assets;
