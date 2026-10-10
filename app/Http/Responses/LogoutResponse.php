<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;

class LogoutResponse implements LogoutResponseContract
{
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? response()->noContent()
            : redirect()->route('login')->with('status', 'You have been logged out.');
    }
}
