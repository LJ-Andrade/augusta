<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the activity logs.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $activityLogs = Activity::with('causer', 'subject')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return ActivityLogResource::collection($activityLogs);
    }
}
