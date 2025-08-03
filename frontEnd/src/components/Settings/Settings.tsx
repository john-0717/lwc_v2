import { LogOut, Lock, Mail } from "lucide-react"
import React from "react"

const SettingsComponent: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>

            <div className="space-y-8">
                {/* Password Change */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <Lock className="h-5 w-5 mr-2" />
                        Change Password
                    </h3>
                    <form className="space-y-4">
                        <input
                            type="password"
                            placeholder="Current password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                            Update Password
                        </button>
                    </form>
                </div>

                {/* Email Settings */}
                {/* <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Email Preferences
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Email notifications for new replies to my questions</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Email notifications for prayer request updates</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Weekly community digest</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Monthly newsletter</span>
                        </label>
                    </div>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                        Save Preferences
                    </button>
                </div> */}

                {/* Privacy Settings */}
                {/* <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Show my profile to other community members</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Allow others to see my questions and prayers</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Show my activity status</span>
                        </label>
                    </div>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                        Update Privacy
                    </button>
                </div> */}

                {/* Logout */}
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="text-lg font-medium text-red-800 mb-4 flex items-center">
                        <LogOut className="h-5 w-5 mr-2" />
                        Account Actions
                    </h3>
                    <div className="space-y-3">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                        <p className="text-sm text-red-600">
                            You will be signed out of your account and redirected to the home page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsComponent;