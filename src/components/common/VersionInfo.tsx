import React, { useState } from 'react';
import { Info, Clock, Package, GitBranch, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useVersion } from '../../utils/version';

interface VersionInfoProps {
  showInFooter?: boolean;
  showDetailed?: boolean;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ 
  showInFooter = false, 
  showDetailed = false 
}) => {
  const { currentVersion, allVersions, formatVersion, formatBuildInfo, getVersionBadgeColor } = useVersion();
  const [showModal, setShowModal] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  if (showInFooter) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
        >
          <Package size={12} />
          <span>{formatVersion()}</span>
        </button>
        <span>•</span>
        <span>{formatBuildInfo()}</span>
      </div>
    );
  }

  if (showDetailed) {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="mr-2 text-blue-600" size={20} />
              Informações da Versão
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Info size={14} className="mr-1" />
              Ver Histórico
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <GitBranch size={16} className="text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Versão</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">v{currentVersion.version}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVersionBadgeColor(currentVersion.release)}`}>
                  {currentVersion.release}
                </span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Package size={16} className="text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Build</span>
              </div>
              <span className="text-lg font-bold text-gray-900">#{currentVersion.buildNumber}</span>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Clock size={16} className="text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Data</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {new Date(currentVersion.buildDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Info size={16} className="text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Features</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{currentVersion.features.length}</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Novas Funcionalidades
              </h4>
              <ul className="space-y-2">
                {currentVersion.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {currentVersion.bugFixes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Correções e Melhorias
                </h4>
                <ul className="space-y-2">
                  {currentVersion.bugFixes.map((fix, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Version History Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <GitBranch className="mr-2 text-blue-600" size={24} />
                  Histórico de Versões
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  {allVersions.map((version) => (
                    <div key={version.version} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedVersion(
                          expandedVersion === version.version ? null : version.version
                        )}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-gray-900">
                            v{version.version}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVersionBadgeColor(version.release)}`}>
                            {version.release}
                          </span>
                          <span className="text-sm text-gray-500">
                            Build #{version.buildNumber}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(version.buildDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {expandedVersion === version.version ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </button>
                      
                      {expandedVersion === version.version && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Funcionalidades ({version.features.length})
                              </h4>
                              <ul className="space-y-2">
                                {version.features.map((feature, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {version.bugFixes.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  Correções ({version.bugFixes.length})
                                </h4>
                                <ul className="space-y-2">
                                  {version.bugFixes.map((fix, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-start">
                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {fix}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {version.breaking && version.breaking.length > 0 && (
                              <div className="lg:col-span-2">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                  Mudanças Importantes
                                </h4>
                                <ul className="space-y-2">
                                  {version.breaking.map((change, index) => (
                                    <li key={index} className="text-sm text-red-600 flex items-start">
                                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {change}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVersionBadgeColor(currentVersion.release)}`}>
        {formatVersion()}
      </span>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Info size={12} />
      </button>
    </div>
  );
};

export default VersionInfo;