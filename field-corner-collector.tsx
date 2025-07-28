"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, CheckCircle, RotateCcw, Save } from "lucide-react"

interface Corner {
  id: number
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
}

interface FieldData {
  farmerId: string
  corners: Corner[]
  createdAt: Date
}

export default function FieldCornerCollector() {
  const [step, setStep] = useState<"start" | "collecting" | "preview" | "saved">("start")
  const [corners, setCorners] = useState<Corner[]>([])
  const [currentCorner, setCurrentCorner] = useState(1)
  const [isCollecting, setIsCollecting] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })
  }

  const markCorner = async () => {
    setIsCollecting(true)
    setLocationError(null)

    try {
      const position = await getCurrentLocation()
      const newCorner: Corner = {
        id: currentCorner,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      }

      setCorners((prev) => [...prev, newCorner])
      setAccuracy(position.coords.accuracy)

      if (currentCorner === 4) {
        setStep("preview")
      } else {
        setCurrentCorner((prev) => prev + 1)
      }
    } catch (error) {
      setLocationError("Unable to get your location. Please check your GPS settings and try again.")
    } finally {
      setIsCollecting(false)
    }
  }

  const startMarking = () => {
    setStep("collecting")
    setCorners([])
    setCurrentCorner(1)
  }

  const resetCollection = () => {
    setCorners([])
    setCurrentCorner(1)
    setStep("collecting")
  }

  const saveField = () => {
    const fieldData: FieldData = {
      farmerId: "farmer_123", // This would come from user context
      corners,
      createdAt: new Date(),
    }

    // In a real app, this would save to a database
    console.log("Saving field data:", fieldData)
    localStorage.setItem("fieldData", JSON.stringify(fieldData))
    setStep("saved")
  }

  const getAccuracyColor = (acc: number) => {
    if (acc <= 5) return "bg-green-500"
    if (acc <= 10) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getAccuracyText = (acc: number) => {
    if (acc <= 5) return "Excellent"
    if (acc <= 10) return "Good"
    return "Fair"
  }

  if (step === "start") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Let's Mark Your Field Corners!</CardTitle>
            <CardDescription>To map your field, we'll need to mark the 4 corners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Please go to each corner of your field</li>
                <li>• Stand at the corner point</li>
                <li>• Tap 'Mark Corner' when you're in position</li>
                <li>• We'll guide you through all 4 corners</li>
              </ul>
            </div>
            <Button onClick={startMarking} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <MapPin className="w-5 h-5 mr-2" />📍 Mark Field Corners
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "collecting") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Corner {currentCorner} of 4</CardTitle>
              <Badge variant="outline">{corners.length}/4 Complete</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(corners.length / 4) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {corners.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">✅ Corner {corners.length} saved successfully!</p>
                {accuracy && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getAccuracyColor(accuracy)}`} />
                    <span className="text-sm text-gray-600">
                      Accuracy: {accuracy.toFixed(1)}m ({getAccuracyText(accuracy)})
                    </span>
                  </div>
                )}
              </div>
            )}

            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                Stand at corner {currentCorner} of your field and press the button below when you're in position.
              </AlertDescription>
            </Alert>

            {locationError && (
              <Alert variant="destructive">
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            <Button onClick={markCorner} disabled={isCollecting} className="w-full" size="lg">
              {isCollecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Mark Corner {currentCorner}
                </>
              )}
            </Button>

            {corners.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Collected Corners:</h4>
                <div className="space-y-1">
                  {corners.map((corner) => (
                    <div key={corner.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        Corner {corner.id}: {corner.latitude.toFixed(6)}, {corner.longitude.toFixed(6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "preview") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Field Boundary Complete
            </CardTitle>
            <CardDescription>Review your field corners before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Field Preview</h4>
              <div className="space-y-2">
                {corners.map((corner) => (
                  <div key={corner.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">Corner {corner.id}:</span>
                    <span className="text-gray-600">
                      {corner.latitude.toFixed(6)}, {corner.longitude.toFixed(6)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Collected on: {new Date().toLocaleString()}</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Is this your field boundary?</strong>
                <br />
                Please confirm that all 4 corners are correctly positioned.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetCollection} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />❌ Re-collect
              </Button>
              <Button onClick={saveField} className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />✅ Save Field
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "saved") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">🎉 Field Marked Successfully!</CardTitle>
            <CardDescription>Your field boundary has been saved and is ready for use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Field Summary</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>• 4 corners collected</p>
                <p>• Boundary polygon created</p>
                <p>• Data saved to your account</p>
              </div>
            </div>

            <Button onClick={() => setStep("start")} className="w-full" variant="outline">
              Mark Another Field
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
